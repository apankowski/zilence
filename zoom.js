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

import { zLog, zDebug } from './utils.js'

export const Zoom = class {

    constructor() {
        this.windowCreatedSignal = null
        this.windowSignals = new Map()
        this.onScreenSharingEnabled = null
        this.onScreenSharingDisabled = null
    }

    enableScreenSharingTracking(onScreenSharingEnabled, onScreenSharingDisabled) {
        this.disableScreenSharingTracking()
        zDebug('Enabling screen sharing tracking')
        this.onScreenSharingEnabled = onScreenSharingEnabled
        this.onScreenSharingDisabled = onScreenSharingDisabled
        this.windowCreatedSignal = global.display.connect('window-created', (_, w) => this._onWindowAdded(w))
        // Process all existing windows
        global.get_window_actors()
            .map((app) => app.metaWindow)
            .forEach((w) => this._onWindowAdded(w))
        zLog('Screen sharing tracking enabled')
    }

    _onWindowAdded(w) {
        if (this._isZoomScreenSharingToolbar(w)) {
            zDebug(`Screen sharing window detected, wmclass: '${w.get_wm_class()}' title: '${w.get_title()}'`)
            this.windowSignals.set(w, w.connect('unmanaged', (w) => this._onWindowRemoved(w)))
            if (this.onScreenSharingEnabled) this.onScreenSharingEnabled()
        }
    }

    _isZoomScreenSharingToolbar(w) {
        return w.get_wm_class() === 'zoom' && w.get_title() === 'as_toolbar'
    }

    _onWindowRemoved(w) {
        zDebug(`Screen sharing window disappeared, wmclass: '${w.get_wm_class()}' title: '${w.get_title()}'`)
        w.disconnect(this.windowSignals.get(w))
        this.windowSignals.delete(w)
        if (this.onScreenSharingDisabled) this.onScreenSharingDisabled()
    }

    disableScreenSharingTracking() {
        if (this.windowCreatedSignal) {
            zDebug('Disabling screen sharing tracking')
            global.display.disconnect(this.windowCreatedSignal)
            this.windowCreatedSignal = null
            this.windowSignals.forEach((w, signal, _) => w.disconnect(signal))
            this.windowSignals = new Map()
            this.onScreenSharingEnabled = null
            this.onScreenSharingDisabled = null
            zLog('Screen sharing tracking disabled')
        }
    }

    dispose() {
        this.disableScreenSharingTracking()
    }
}
