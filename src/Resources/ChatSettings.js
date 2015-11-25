/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

ChatSettings = function(app) {
    this.app = app;
    this.initiated = false;

    this.init = function() {
        var self = this;

        self.initiated = true;

        var inputConnectionAuto = $('#chat-settings-modal input[name=chat-connection-auto]')[0];
        var inputNotifications  = $('#chat-settings-modal input[name=chat-browser-notifications]')[0];
        var inputVolume         = $('#chat-settings-modal input[name=chat-sound-volume]')[0];

        inputConnectionAuto.checked = this.app.autologin ? true : false;
        inputNotifications.checked  = this.app.showBrowserNotifications ? true : false;
        $(inputVolume).val(this.app.soundVolume * 100).attr('data-slider-value', this.app.soundVolume * 100);

        $('#chat-settings-sound-play').click(function() {
            ChatSoundNotification.notify();
        });

        $('#chat-settings-modal input[type=checkbox]').bootstrapSwitch({
            onText: APP.t('syes'),
            offText: APP.t('sno'),
            size: 'small'
        }).on('switchChange.bootstrapSwitch', function(event, state) {
            self.app.autologin = inputConnectionAuto.checked ? 1 : 0;
            self.app.showBrowserNotifications = inputNotifications.checked ? 1 : 0;

            self.updateSettings();
        });

        $('#chat-settings-modal input[name=chat-sound-volume]').slider({
            tooltip: 'always',
            formatter: function(value) {
                return value + '%';
            }
        });

        $('#chat-sound-volume-slider').on('mouseup', function() {
            self.app.soundVolume = inputVolume.value / 100;
            ChatSoundNotification.sound.volume(self.app.soundVolume);

            self.updateSettings();
        });
    };

    this.updateSettings = function() {
        APP.AJAX.call({
            url: APP.createUrl('Chat', 'Settings', 'save'),
            data: {
                connection_autologin: this.app.autologin,
                notification_browsershow: this.app.showBrowserNotifications,
                sound_volume: this.app.soundVolume,
            }
        });
    };
};
