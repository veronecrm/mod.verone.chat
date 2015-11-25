/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

var ChatSoundNotification = {
    sound: null,
    init: function(volume) {
        ChatSoundNotification.sound = new Howl({
            urls: ['/modules/Chat/sound.mp3', '/modules/Chat/sound.ogg'],
            volume: volume
        });
    },
    notify: function() {
        ChatSoundNotification.sound.play();
    }
};
