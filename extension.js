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
const notifications = Me.imports.notifications;

class Extension {

    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this._active = false;
        this._notifications = new notifications.Notifications();
        this._windowCreatedHandlerId = global.display.connect('window-created', this._onWindowCreated.bind(this));

        // Activate the extension if Zoom window already exists
        global.get_window_actors()
            .map(app => app.metaWindow)
            .forEach(this._processWindow);
    }

    disable() {
        this._deactivate();
        global.display.disconnect(this._windowCreatedHandlerId);
        this._notifications.dispose();
    }

    _isZoomScreenSharingToolbar(w) {
        return w.get_wm_class() === "zoom" && w.get_title() === "as_toolbar";
    }

    _onWindowCreated(d, w) {
        this._processWindow(w);
    }

    _processWindow(w) {
        if (this._isZoomScreenSharingToolbar(w)) {
            log("[Zilence] Screen sharing window detected, wmclass: " + w.get_wm_class() + " title: " + w.get_title());
            w.connect('unmanaged', this._onWindowUnmanaged.bind(this));
            this._activate();
        }
    }

    _onWindowUnmanaged(w) {
        log("[Zilence] Screen sharing window disappeared, wmclass: " + w.get_wm_class() + " title: " + w.get_title());
        this._deactivate();
    }

    _activate() {
        if (!this._active) {
            if (!this._notifications.areEnabled()) {
                log("[Zilence] Notifications are disabled - not activating");
                return;
            }
            this._active = true;
            log("[Zilence] Disabling notifications");
            this._notifications.disable();
            this._notifications.onEnabledChanged(() => {
                if (this._notifications.areEnabled()) {
                    log("[Zilence] Notifications enabled externally - deactivating");
                }
                this._deactivate(false);
            });
        }
    }

    _deactivate(enableNotifications = true) {
        if (this._active) {
            this._notifications.disconnectAll();
            if (enableNotifications) {
                log("[Zilence] Enabling notifications");
                this._notifications.enable();
            }
            this._active = false;
        }
    }
}

function init(metadata) {
    return new Extension(metadata.uuid);
}
