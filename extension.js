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

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'
import { zLog, zDebug } from './utils.js'
import { Zoom } from './zoom.js'
import { Notifications } from './notifications.js'

export default class ZilenceExtension extends Extension {

    constructor(metadata) {
        super(metadata)
        this.zoom = null
        this.notifications = null
        this.active = false
    }

    enable() {
        zDebug('Enabling extension')
        this.zoom = new Zoom()
        this.notifications = new Notifications()
        this.active = false
        this.zoom.enableScreenSharingTracking(() => this._activate(), () => this._deactivate())
        zLog('Extension enabled')
    }

    disable() {
        zLog('Disabling extension')
        this._deactivate()
        this.zoom.dispose()
        this.zoom = null
        this.notifications.dispose()
        this.notifications = null
        this.active = false
        zLog('Extension disabled')
    }

    _activate() {
        if (!this.active) {
            if (!this.notifications.areEnabled()) {
                zLog('Notifications are disabled - not activating')
                return
            }
            this.active = true
            zLog('Disabling notifications')
            this.notifications.disable()
            this.notifications.enableChangeTracking(() => {
                if (this.notifications.areEnabled()) {
                    zLog('Notifications enabled externally - deactivating')
                }
                this._deactivate(false)
            })
        }
    }

    _deactivate(enableNotifications = true) {
        if (this.active) {
            this.notifications.disableChangeTracking()
            if (enableNotifications) {
                zLog('Enabling notifications')
                this.notifications.enable()
            }
            this.active = false
        }
    }
}
