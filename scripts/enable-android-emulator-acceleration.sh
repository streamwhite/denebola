#!/usr/bin/env bash
#
# Enable Android Emulator hardware acceleration (KVM) on Ubuntu.
#
# Usage:
#   ./scripts/enable-android-emulator-acceleration.sh          # install and enable
#   ./scripts/enable-android-emulator-acceleration.sh --check  # verify only

set -euo pipefail

readonly KVM_DEVICE="/dev/kvm"
readonly KVM_GROUP="kvm"
readonly LIBVIRT_GROUP="libvirt"
readonly KVM_UDEV_RULE_FILE="/etc/udev/rules.d/99-android-emulator-kvm.rules"
readonly OS_RELEASE_FILE="/etc/os-release"
readonly APT_PACKAGES=(cpu-checker qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils)

usage() {
  printf 'Usage: %s [--check|--help]\n' "$0"
  printf '  (no flag)  install and enable KVM acceleration\n'
  printf '  --check    verify the current acceleration status only\n'
}

resolve_mode() {
  local arg
  for arg in "$@"; do
    case "${arg}" in
      --check|check) printf 'check'; return ;;
      --help|-h|help) printf 'help'; return ;;
    esac
  done
  printf 'enable'
}

readonly MODE="$(resolve_mode "$@")"

info() { printf '\033[1;34m[info]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*" >&2; }
fail() { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

run_privileged() {
  if [[ "${EUID}" -eq 0 ]]; then
    "$@"
  else
    sudo "$@"
  fi
}

require_linux() {
  [[ "$(uname -s)" == "Linux" ]] || fail "This script supports Linux only."
}

require_debian_like() {
  [[ -r "${OS_RELEASE_FILE}" ]] || fail "Cannot read ${OS_RELEASE_FILE}."
  local distro
  distro="$(. "${OS_RELEASE_FILE}" && printf '%s' "${ID:-}")"
  if [[ "${distro}" != "ubuntu" && "${distro}" != "debian" ]]; then
    warn "Detected '${distro:-unknown}'. This script targets Ubuntu/Debian."
  fi
}

detect_cpu_vendor() {
  if grep -qm1 'vmx' /proc/cpuinfo; then
    printf 'intel'
  elif grep -qm1 'svm' /proc/cpuinfo; then
    printf 'amd'
  else
    printf 'unknown'
  fi
}

count_virtualization_extensions() {
  grep -Ec '(vmx|svm)' /proc/cpuinfo || true
}

install_packages() {
  info "Installing KVM packages: ${APT_PACKAGES[*]}"
  run_privileged apt-get update
  run_privileged apt-get install -y "${APT_PACKAGES[@]}"
}

load_kvm_modules() {
  local vendor="$1"
  run_privileged modprobe kvm
  case "${vendor}" in
    intel) run_privileged modprobe kvm_intel ;;
    amd) run_privileged modprobe kvm_amd ;;
    *) warn "Unknown CPU vendor. Loaded the base kvm module only." ;;
  esac
  info "Loaded KVM kernel modules for '${vendor}'."
}

add_current_user_to_groups() {
  local user="${SUDO_USER:-${USER}}"
  local group
  for group in "${KVM_GROUP}" "${LIBVIRT_GROUP}"; do
    if id -nG "${user}" | grep -qw "${group}"; then
      info "User '${user}' already belongs to group '${group}'."
      continue
    fi
    run_privileged usermod -aG "${group}" "${user}"
    info "Added user '${user}' to group '${group}'."
  done
}

ensure_kvm_udev_rule() {
  local rule='KERNEL=="kvm", GROUP="kvm", MODE="0660"'
  if [[ -f "${KVM_UDEV_RULE_FILE}" ]] && grep -qF "${rule}" "${KVM_UDEV_RULE_FILE}"; then
    info "Persistent udev rule already present."
    return
  fi
  printf '%s\n' "${rule}" | run_privileged tee "${KVM_UDEV_RULE_FILE}" >/dev/null
  run_privileged udevadm control --reload-rules
  run_privileged udevadm trigger
  info "Installed persistent udev rule for ${KVM_DEVICE}."
}

find_emulator() {
  local candidate
  for candidate in \
    "${ANDROID_HOME:-/nonexistent}/emulator/emulator" \
    "${ANDROID_SDK_ROOT:-/nonexistent}/emulator/emulator" \
    "${HOME}/Android/Sdk/emulator/emulator"; do
    if [[ -x "${candidate}" ]]; then
      printf '%s' "${candidate}"
      return 0
    fi
  done
  command -v emulator 2>/dev/null || return 1
}

warn_if_nested() {
  command -v systemd-detect-virt >/dev/null 2>&1 || return 0
  local virt
  virt="$(systemd-detect-virt || true)"
  if [[ -n "${virt}" && "${virt}" != "none" ]]; then
    warn "Running inside '${virt}'. Enable nested virtualization on the host, or KVM will be unavailable."
  fi
}

verify_acceleration() {
  [[ -e "${KVM_DEVICE}" ]] || fail "${KVM_DEVICE} is missing. Enable VT-x/AMD-V in BIOS/UEFI, then reboot."
  if command -v kvm-ok >/dev/null 2>&1; then
    run_privileged kvm-ok
  fi
  local emulator
  emulator="$(find_emulator || true)"
  if [[ -n "${emulator}" ]]; then
    "${emulator}" -accel-check || warn "Emulator could not confirm hardware acceleration."
  else
    warn "Android emulator not found; skipped the -accel-check step."
  fi
}

main() {
  if [[ "${MODE}" == "help" ]]; then
    usage
    return
  fi
  require_linux
  require_debian_like

  local extensions vendor
  extensions="$(count_virtualization_extensions)"
  if [[ "${extensions}" -eq 0 ]]; then
    fail "CPU virtualization (VT-x/AMD-V) not detected. Enable it in BIOS/UEFI, then reboot."
  fi
  vendor="$(detect_cpu_vendor)"
  info "Detected CPU virtualization extensions (vendor: ${vendor})."

  if [[ "${MODE}" == "check" ]]; then
    verify_acceleration
    return
  fi

  warn_if_nested
  install_packages
  load_kvm_modules "${vendor}"
  add_current_user_to_groups
  ensure_kvm_udev_rule
  verify_acceleration
  info "Done. Log out and back in, then restart the emulator."
}

main
