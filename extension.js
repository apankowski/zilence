/*
 * Zilence extension for Gnome Shell.
 * Copyright 2021 Andrzej Pańkowski
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Notifications = Me.imports.notifications.Notifications;

let active;
let notifications;
let windowCreatedHandlerId;

function init() {
}

function enable() {
    active = false;
    notifications = new Notifications();
    windowCreatedHandlerId = global.display.connect('window-created', _onWindowCreated.bind(this));

    // Activate the extension if Zoom window already exists
    global.get_window_actors()
        .map(app => app.metaWindow)
        .forEach(_processWindow);
}

function disable() {
    _deactivate();
    global.display.disconnect(windowCreatedHandlerId);
    windowCreatedHandlerId = null;
    notifications.dispose();
    notifications = null;
}

function _onWindowCreated(d, w) {
    _processWindow(w);
}

function _processWindow(w) {
    if (_isZoomScreenSharingToolbar(w)) {
        log("[Zilence] Screen sharing window detected, wmclass: " + w.get_wm_class() + " title: " + w.get_title());
        w.connect('unmanaged', _onWindowUnmanaged.bind(this));
        _activate();
    }
}

function _isZoomScreenSharingToolbar(w) {
    return w.get_wm_class() === "zoom" && w.get_title() === "as_toolbar";
}

function _onWindowUnmanaged(w) {
    log("[Zilence] Screen sharing window disappeared, wmclass: " + w.get_wm_class() + " title: " + w.get_title());
    _deactivate();
}

function _activate() {
    if (!active) {
        if (!notifications.areEnabled()) {
            log("[Zilence] Notifications are disabled - not activating");
            return;
        }
        active = true;
        log("[Zilence] Disabling notifications");
        notifications.disable();
        notifications.onEnabledChanged(() => {
            if (notifications.areEnabled()) {
                log("[Zilence] Notifications enabled externally - deactivating");
            }
            _deactivate(false);
        });
    }
}

function _deactivate(enableNotifications = true) {
    if (active) {
        notifications.disconnectAll();
        if (enableNotifications) {
            log("[Zilence] Enabling notifications");
            notifications.enable();
        }
        active = false;
    }
}
