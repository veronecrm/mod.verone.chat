/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

var ChatApp = function(api) {
    this.api = api;

    this.boxes = null;
    this.storage;

    this.connectedUsers = [];

    this.panelOpened = false;
    this.browserTabFocused = true;

    this.autologin = 1;
    this.showBrowserNotifications = 1;
    this.soundVolume = 0.5;

    this.init = function() {
        var self = this;

        this.storage = new ChatStorage;
        this.boxes   = new ChatBoxes;

        if(! this.storage.init())
        {
            return false;
        }

        this.boxes.init();

        if(self.showBrowserNotifications)
        {
            ChatBrowserNotification.init();
        }

        ChatSoundNotification.init(this.soundVolume);

        $(window).focus(function() {
            self.browserTabFocused = true;
        }).blur(function() {
            self.browserTabFocused = false;
        });

        this.api.bind('onIncommingMessage', function(result) {
            // If chat box doesn't exists, we create New.
            if(! self.boxes.boxExists(result.from))
            {
                var box = self.createNewBox(result.from, self.findUsernameByResult(result), result.type == 'widget', 1, true);
            }
            // If box exists, we gets it's object.
            else
            {
                var box = self.boxes.findBoxById(result.from);

                box.appendMessage(result.from, result.data, self.formatDate(self.createDateString()));
            }

            /**
             * If is showed, but hasn't focus, we create only simple
             * blink notification for user.
             */
            box.createNotifier(! self.browserTabFocused);

            // Only, when box hasn't focus
            if(box.hasFocus() === false || ! self.browserTabFocused)
            {
                self.notifyForMessage(result);
            }

            /**
             * If widget user doesn't exists in users list,
             * we add it.
             */
            if(result.type == 'widget' && self.widgetExistsInUsersList(result.from) == false)
            {
                self.resolveWidgetUsername({
                    from: result.from,
                    name: self.findUsernameByResult(result)
                }, true);
            }
        })
        .bind('onOutgoingMessage', function(result) {
            var box = self.boxes.findBoxById(result.to);

            if(box)
            {
                box.appendMessage('', result.data, self.formatDate(self.createDateString()));
            }
        })
        .bind('onStatus', function(result) {
            if(result.event === 'connected-clients')
            {
                self.resolveConnectedClients(result.ids);
            }
            else if(result.event === 'history')
            {
                self.prependHistoryBox(result);
            }
            else
            {
                console.log('Status event name: ' + result.event);
            }
        })
        .bind('onClose', function() {
            self.statusSetDisconnected();
            self.resolveConnectedClients([]);
        })
        .bind('onOpen', function() {
            ChatCookieHelper.set('chat-connection-opened', 'yes');
            self.statusSetConnected();

            /**
             * if there are some opened boxes, without messages, we get
             * their history.
             */
            var boxes = self.boxes.getBoxes();

            for(var i in boxes)
            {
                if(boxes[i].lastMessageId == 0)
                {
                    self.requestHistory(boxes[i].id, boxes[i].lastMessageId);
                    boxes[i].showContentLoader();
                }
            }
        });

        $('.chat-sidebar .input .info-select').show();

        $('.chat-sidebar .users').on('click', 'li', function() {
            if(! self.boxes.boxExists($(this).attr('data-id')))
            {
                var box = self.createNewBox($(this).attr('data-id'), $(this).attr('data-name'), $(this).hasClass('is-widget'), $(this).hasClass('connected'), true);
            }
            else
            {
                var box = self.boxes.findBoxById($(this).attr('data-id'));
            }

            box.setFocus();
        });

        // Remove widget from list
        $('.chat-sidebar .users .widgets').on('click', '.btn-widget-remove', function(e) {
            self.removeWidgetUser($(this).parent().attr('data-id'), true);
            e.stopPropagation();
        });

        $('.mod-chat-toggle-chat').click(function(e) {
            if($('.chat-sidebar').hasClass('opened'))
            {
                $('.chat-sidebar').removeClass('opened');
                $('.chat-boxes').removeClass('panel-opened');
                $('#page-wrapper').addClass('animated').css('margin-right', 0);
                setTimeout(function() {
                    $('#page-wrapper').removeClass('animated');
                }, 150);
                $(this).parent().removeClass('active');
                ChatCookieHelper.set('chat-opened', 'no');
                self.panelOpened = false;
            }
            else
            {
                $('.chat-sidebar').addClass('opened');
                $('.chat-boxes').addClass('panel-opened');
                $('#page-wrapper').addClass('animated').css('margin-right', 250);
                setTimeout(function() {
                    $('#page-wrapper').removeClass('animated');
                }, 150);
                $('#page-wrapper').addClass('chat-sidebar-opened');
                $(this).parent().addClass('active');
                ChatCookieHelper.set('chat-opened', 'yes');
                self.panelOpened = true;
            }

            e.preventDefault();
        });

        if($('.chat-sidebar').hasClass('opened'))
        {
            self.panelOpened = true;
            $('.chat-boxes').addClass('panel-opened');
        }

        $('.chat-sidebar .status ul li a').click(function(e) {
            if($(this).parent().hasClass('on'))
            {
                if(self.api.opened === false)
                {
                    self.api.open();
                }
            }
            else
            {
                if(self.api.opened === true)
                {
                    self.api.close();
                    ChatCookieHelper.set('chat-connection-opened', 'no');
                    ChatCookieHelper.remove('chat-connection-opened');
                }
            }

            e.preventDefault();
        });

        // We connect automatically, when connection was opened in last session.
        // Or when user just logged in and setting is set on true;
        if(ChatCookieHelper.get('chat-connection-opened') == 'yes' || (ChatCookieHelper.get('chat-first-request') == 1 && this.autologin))
        {
            self.api.open();
        }

        /**
         * If there are some widgets users in collection, we append them to list.
         */
        var widgets = this.storage.getWidgets();

        for(var i in widgets)
        {
            self.resolveWidgetUsername({
                from: widgets[i].id,
                name: widgets[i].name
            }, false);
        }

        /**
         * If there are some boxes opened, we create them again.
         */
        var boxes = self.storage.getBoxes();

        for(var i in boxes)
        {
            self.createNewBox(boxes[i].id, boxes[i].title, boxes[i].isWidget, self.isConnected(boxes[i].id), boxes[i].opened);
        }
    };

    this.createNewBox = function(id, title, isWidget, status, opened) {
        var self = this;

        var box = self.boxes.createBox({
            title     : title,
            contents  : [],
            id        : id,
            isWidget  : isWidget,
            status    : status,
            opened    : opened
        });

        if(self.api.opened)
        {
            self.requestHistory(id, box.lastMessageId);
            box.showContentLoader();
        }

        self.storage.appendBox({
            title     : title,
            id        : id,
            isWidget  : isWidget,
            status    : status,
            opened    : opened
        });

        box.bind('onMessageSend', function(message, box) {
            if(self.api.opened)
            {
                self.api.sendMessage(box.id, message);
            }
            else
            {
                box.appendMessage('System', 'Jesteś niepołączony z czatem.', self.formatDate(self.createDateString()));
            }
        });

        box.bind('onBoxClose', function(box) {
            self.storage.removeBox(box.id);
        });

        box.bind('onBoxToggle', function(box) {
            var sbox = self.storage.findBox(box.id);

            sbox.opened = box.opened;

            self.storage.updateBox(sbox.id, sbox);
        });

        box.bind('onContentScroll', function(box) {
            // If box was scrolled to top of content...
            if(box.getContent().find('.content').scrollTop() === 0)
            {
                // And if conversation have any else messages in history.
                if(box.hasHistory)
                {
                    self.requestHistory(box.id, box.lastMessageId);
                    box.showContentLoader();
                }
            }
        });

        return box;
    };

    this.resolveConnectedClients = function(ids) {
        this.connectedUsers = ids;

        var self = this;

        $('.chat-sidebar .info-disconnected').show();

        $('.chat-sidebar .users li').each(function() {
            $(this).removeClass('connected');

            for(var i in ids)
            {
                if($(this).data('id') == ids[i])
                {
                    $(this).addClass('connected');
                } 
            }
        });

        var boxes = this.boxes.getBoxes();

        for(var j in boxes)
        {
            boxes[j].setStatus(0);

            for(var i in ids)
            {
                if(boxes[j].id == ids[i])
                {
                    boxes[j].setStatus(1);
                } 
            }
        }
    };

    this.isConnected = function(id) {
        for(var i in this.connectedUsers)
        {
            if(this.connectedUsers[i] == id)
            {
                return true;
            }
        }

        return false;
    };

    this.findUsernameByResult = function(result) {
        if(result.type == 'widget')
        {
            return result.name;
        }
        else if(result.type == 'system')
        {
            return 'System Message';
        }
        else
        {
            var name = '';

            $('.chat-sidebar .users li').each(function() {
                if($(this).data('id') == result.from)
                {
                    name = $(this).text();
                }
            });

            return name;
        }
    };

    this.resolveWidgetUsername = function(result, appendToStorage) {
        var founded = false;

        $('.chat-sidebar .users li').each(function() {
            if($(this).data('id') == result.from)
            {
                founded = $(this);
            }
        });

        if(! founded)
        {
            $('.chat-sidebar .users .widgets ul').append('<li data-id="' + result.from + '" data-name="' + result.name + '" class="is-widget connected"><i class="fa fa-remove btn-widget-remove"></i> <span class="conn-dot"></span> <small>(widget)</small> ' + result.name + '</li>')

            if(appendToStorage)
            {
                this.storage.appendWidget(result.from, result.name);
            }

            $('.chat-sidebar .users .widgets').removeClass('hidden');
        }
    };

    this.removeWidgetUser = function(id, removeFromStorage) {
        $('.chat-sidebar .users .widgets li').each(function() {
            if($(this).data('id') == id)
            {
                $(this).remove();
            }
        });

        if(removeFromStorage)
        {
            this.storage.removeWidget(id);
        }

        if($('.chat-sidebar .users .widgets li').length == 0)
        {
            $('.chat-sidebar .users .widgets').addClass('hidden');
        }
    };

    this.widgetExistsInUsersList = function(id) {
        var founded = false;

        $('.chat-sidebar .users .widgets li').each(function() {
            if($(this).data('id') == id)
            {
                founded = true;
            }
        });

        return founded;
    };

    this.isWidget = function(id) {
        var isset = false;
        $('.chat-sidebar .users li').each(function() {
            if($(this).data('id') == id && $(this).hasClass('is-widget'))
            {
                isset = true;
            }
        });

        return isset;
    };

    this.notifyForMessage = function(result) {
        if(this.showBrowserNotifications && this.browserTabFocused === false)
        {
            ChatBrowserNotification.notify('Nowa wiadomość', 'Masz nową wiadomość od ' +  this.findUsernameByResult(result));
        }

        var focusedBox = this.boxes.getFocusedBox();

        // Notify with sound, only when message is not from current receiver or tab is not focused
        if(! focusedBox || (focusedBox && focusedBox.id != result.from) || this.browserTabFocused === false)
        {
            ChatSoundNotification.notify();
        }
    };

    this.requestHistory = function(userId, lastMessageId) {
        this.api.send('*', 'history', {
            lastMessageId : lastMessageId,
            userId        : userId
        });
    };

    this.prependHistoryBox = function(result) {
        var box = this.boxes.findBoxById(result.userId);
        var id  = this.api.userId;
        var scrollBefore = box.getContentScrollInfo();

        for(var i in result.data)
        {
            box.appendMessage(result.data[i].from == id ? null : result.data[i].from, result.data[i].message, this.formatDate(result.data[i].date), true /* prepend */);
        }

        var scrollAfter = box.getContentScrollInfo();

        /**
         * If in this request we didn't get results, we dont want to
         * request next time because there is nothing else in history.
         */
        if(result.data.length == 0)
        {
            box.hasHistory = false;
        }

        box.lastMessageId = result.lastMessageId;

        box.hideContentLoader();

        /**
         * When we append new messages, scrolling updates, and content hides.
         * Here, we gets position of tos message, from last history request
         * and scroll to this message, so user can scroll to top again,
         * and he don't lose reading context.
         */
        box.scrollContentTo(scrollAfter.scrollHeight - scrollBefore.scrollHeight);
    };

    this.statusSetConnected = function() {
        $('.chat-sidebar .status ul li').removeClass('active');
        $('.chat-sidebar .status .name .dot').addClass('c');
    };

    this.statusSetDisconnected = function() {
        $('.chat-sidebar .status ul li').removeClass('active');
        $('.chat-sidebar .status .name .dot').removeClass('c');
    };

    this.createDateString = function() {
        return (new Date()).toString();
    };

    this.formatDate = function(dateString) {
        var date  = new Date(dateString);
        var today = new Date();

        var hour = date.getHours();
                hour = hour <= 9 ? '0' + hour : hour;
        var minute = date.getMinutes();
                minute = minute <= 9 ? '0' + minute : minute;

        var str = hour + ':' + minute;

        // If date is not from today, we add to date
        // month and day.
        if(date.getFullYear() != today.getFullYear() || date.getMonth() != today.getMonth() || date.getDate() != today.getDate())
        {
            var day = date.getDate();
                    day = day <= 9 ? '0' + day : day;
            var month = date.getMonth() + 1;
                    month = month <= 9 ? '0' + month : month;

            str = str + ', ' + day + '.' + month + '.' + date.getFullYear();
        }

        return str;
    };
};
