/*
 * Zilence extension for Gnome Shell.
 * Copyright 2021-2022 Andrzej Pańkowski
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

const Gio = imports.gi.Gio;

var Notifications = class {

    constructor() {
        this.connections = [];
        this._settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.notifications' });
    }

    enable() {
        this._settings.set_boolean('show-banners', true);
    }

    disable() {
        this._settings.set_boolean('show-banners', false);
    }

    areEnabled() {
        return this._settings.get_boolean('show-banners');
    }

    onEnabledChanged(callback) {
        let id = this._settings.connect('changed::show-banners', callback);
        this.connections.push(id);
    }

    disconnectAll() {
        this.connections.forEach((id) => {
            this._settings.disconnect(id);
        });
        this.connections = [];
    }

    dispose() {
        this.disconnectAll();
        this._settings.run_dispose();
        this._settings = null;
    }
}
