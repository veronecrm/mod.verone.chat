/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

var ChatCookieHelper = {
    set: function(name, value, exdays) {
        $.cookie(name, value, { expires: exdays || 365 });
    },

    get: function(name) {
        return $.cookie(name);
    },

    remove: function(name) {
        $.removeCookie(name);
    }
};
