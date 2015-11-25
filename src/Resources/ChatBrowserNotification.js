/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

var ChatBrowserNotification = {
    notification: null,
    canNotify: false,
    init: function() {
        if("Notification" in window)
        {
            if(Notification.permission === 'denied')
            {
                if(confirm('Za chwilę zostaniesz poproszony o zezwolenie na wyświetlanie powiadomień z tej strony. Zaakceptuj je, by móc dostawać powiadomienia o nowych wiadomościach z Czatu.'))
                {
                    Notification.requestPermission(function (permission) {
                        if(permission === "granted")
                        {
                            ChatBrowserNotification.canNotify = true;
                        }
                        else
                        {
                            ChatBrowserNotification.canNotify = false;
                            alert('Nie zezwolono na pokazywanie powiadomień.');
                        }
                    });
                }
            }
            else
            {
                ChatBrowserNotification.canNotify = true;
            }
        }
    },
    notify: function(title, content) {
        if(ChatBrowserNotification.canNotify && ChatBrowserNotification.notification == null)
        {
            ChatBrowserNotification.notification = new Notification(title, {
                'body': content
            });

            ChatBrowserNotification.notification.onclose = function() {
                ChatBrowserNotification.notification = null;
            };
        }
    }
};
