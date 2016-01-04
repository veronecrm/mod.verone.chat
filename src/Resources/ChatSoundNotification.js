/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 - 2016 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

var ChatSoundNotification = {
    sound: null,
    init: function(volume) {
        ChatSoundNotification.sound = new Howl({
            urls: [APP.filePath('/modules/Chat/sound.mp3'), APP.filePath('/modules/Chat/sound.ogg')],
            volume: volume
        });
    },
    notify: function() {
        ChatSoundNotification.sound.play();
    }
};
