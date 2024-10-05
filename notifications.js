/*
 * Zilence extension for Gnome Shell.
 * Copyright 2021-2024 Andrzej Pańkowski
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

import Gio from "gi://Gio"

export const Notifications = class {

    constructor() {
        this.settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.notifications' })
        this.settingChangedSignal = null
    }

    areEnabled() {
        return this.settings.get_boolean('show-banners')
    }

    enable() {
        this.settings.set_boolean('show-banners', true)
    }

    disable() {
        this.settings.set_boolean('show-banners', false)
    }

    enableChangeTracking(callback) {
        this.disableChangeTracking()
        this.settingChangedSignal = this.settings.connect('changed::show-banners', () => callback())
        // GSettings require reading the setting to receive its corresponding 'changed' signal
        this.areEnabled()
    }

    disableChangeTracking() {
        if (this.settingChangedSignal) {
            this.settings.disconnect(this.settingChangedSignal)
            this.settingChangedSignal = null
        }
    }

    dispose() {
        this.disableChangeTracking()
        this.settings = null
    }
}
