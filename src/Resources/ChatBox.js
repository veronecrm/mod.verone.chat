/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 - 2016 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

/**
 * Chat Box entity.
 */
var ChatBox = function(options) {
    this.title    = '';
    this.id       = '';
    this.isWidget = false;
    this.content  = $([]);
    this.opened   = true;
    this.focused  = false;
    this.notifyInterval = null;
    this.dispatcher = null;

    this.smileys = [
        [['\\s\\:\\)\\s'], '1'],
        [['\\s\\;\\)\\s'], '2'],
        [['\\s\\:d\\s','\\s\\:D\\s','\\s\\;d\\s','\\s\\;D\\s'], '3'],
        [['\\s\\:p\\s','\\s\\;p\\s','\\s\\:P\\s','\\s\\;P\\s'], '4'],
        [['\\s\\:\\>\\s','\\s\\;\\>\\s'], '5'],
        [['\\s\\:\\(\\s'], '6'],
        [['\\s\\;\\(\\s'], '7'],
        [['\\s\\:o\\s','\\s\\;o\\s','\\s\\:\\(\\)\\s'], '8'],
        [['\\s\\:ok\\s','\\sok\\s','\\sOK\\s','\\sOk\\s','\\soK\\s'], '9'],
        [['\\s\\:buu\\s','\\sbuu\\s','\\sBUU\\s','\\sBuu\\s'], '10']
    ];

    /**
     * URL check pattern. 
     * Taken from: https://mathiasbynens.be/demo/url-regex (@mattfarina)
     * @type RegExp
     */
    this.urlPattern = /([a-z][a-z0-9\*\-\.]*):\/\/(?:(?:(?:[\w\.\-\+!$&'\(\)*\+,;=]|%[0-9a-f]{2})+:)*(?:[\w\.\-\+%!$&'\(\)*\+,;=]|%[0-9a-f]{2})+@)?(?:(?:[a-z0-9\-\.]|%[0-9a-f]{2})+|(?:\[(?:[0-9a-f]{0,4}:)*(?:[0-9a-f]{0,4})\]))(?::[0-9]+)?(?:[\/|\?](?:[\w#!:\.\?\+=&@!$'~*,;\/\(\)\[\]\-]|%[0-9a-f]{2})*)?/img;

    /**
     * Stores last message ID number, showed in box.
     * @type integer
     */
    this.lastMessageId = 0;

    /**
     * Stores information, about history conversation. If history
     * showed in this box hasn't any else messages, this property
     * have value set as false.
     * @type boolean
     */
    this.hasHistory = true;

    /**
     * Initiation of Box.
     * @param  Object options Box options.
     * @return void
     */
    this.init = function(options) {
        this.title    = options.title;
        this.id       = options.id;
        this.isWidget = options.isWidget;
        this.opened   = options.opened;

        this.dispatcher = new EventDispatcher();
        //this.dispatcher.bind('onMessageSend', options.onMessageSend);
        //this.dispatcher.bind('onBoxClose', options.onBoxClose);
        //this.dispatcher.bind('onBoxToggle', options.onBoxToggle);
        //this.dispatcher.bind('onContentScroll', options.onContentScroll);

        var box = $(
    '<div class="box' + (options.isWidget ? ' is-widget' : '') + (options.opened ? '' : ' hd') + '" data-id="' + options.id + '">'
    + '<div class="headline">'
        + '<span class="btns">'
            + '<i class="fa fa-remove close-box" title="Zamknij okno"></i>'
        + '</span>'
        + '<span class="username"><span class="status' + (options.status ? ' c' : '') + '"></span> ' + (options.isWidget ? '<small>(widget)</small> ' : '') + options.title + '</span>'
    + '</div>'
    + '<div class="content loading">'
        + '<span class="loader"><span class="fa fa-circle-o-notch fa-spin"></span></span>'
    + '</div>'
    + '<div class="input">'
        + '<textarea></textarea>'
    + '</div>'
+ '</div>'
        );

        if(options.contents.length > 0)
        {
            var content = box.find('.content');

            for(var i in options.contents)
            {
                this.appendMessage(options.contents[i].from, options.contents[i].data, '');
            }
        }

        this.bindBoxEvents(box);

        this.content = box;
    };

    /**
     * Bing event.
     * @param  string   event    Event name.
     * @param  callable listener Listener callable.
     * @return self
     */
    this.bind = function(event, listener) {
        this.dispatcher.bind(event, listener);

        return this;
    };

    /**
     * Trigger event.
     * @param  string event  Event name.
     * @param  array  params Array of params for triggered event.
     * @return self
     */
    this.trigger = function(event, params) {
        this.dispatcher.trigger(event, params);

        return this;
    };

    /**
     * Bind events on box elements.
     * @param  jQuery box Box HTMl object
     * @return void
     */
    this.bindBoxEvents = function(box) {
        var self = this;

        box.find('.headline i').click(function(e) {
            if($(this).hasClass('close-box'))
            {
                // This event is called by ChatBoxes main object.
            }

            e.stopPropagation();
        });

        box.find('.headline').click(function(e) {
            self.toggle();

            e.stopPropagation();
        });

        box.find('.content').click(function() {
            self.setFocus();
        }).scroll(function() {
            self.trigger('onContentScroll', [self]);
        });

        box.find('textarea').keydown(function(e) {
            if(e.keyCode == 13 && e.shiftKey === false && jQuery.trim($(this).val()) != '')
            {
                self.trigger('onMessageSend', [$(this).val(), self]);
                $(this).val('');
                return false;
            }
        });
    };

    /**
     * Create blink effect of box.
     * @param boolean force Force notification?
     * @return self
     */
    this.createNotifier = function(force) {
        var self = this;

        if(force || (! this.focused && ! this.notifyInterval))
        {
            clearInterval(this.notifyInterval);

            this.notifyInterval = setInterval(function() {
                if(self.content.hasClass('ntf'))
                {
                    self.content.removeClass('ntf');
                }
                else
                {
                    self.content.addClass('ntf');
                }
            }, 500);
        }

        return this;
    };

    /**
     * Clears notifier.
     * @return self
     */
    this.clearNotifier = function() {
        clearInterval(this.notifyInterval);
        this.notifyInterval = null;
        this.content.removeClass('ntf');

        return this;
    };

    /**
     * Replace chars groups with emoticons spans.
     * @param  string content Content to search for chars.
     * @return string
     */
    this.replaceSmileys = function(content) {
        content = ' ' + content + ' ';

        for(var i in this.smileys)
        {
            for(var j in this.smileys[i][0])
            {
                content = content.replace(new RegExp(this.smileys[i][0][j], 'gi'), ' <span class="emot emot-' + this.smileys[i][1] + '">&nbsp;</span> ');
            }
        }

        return content;
    };

    /**
     * Search for URLS in content, and replace it with
     * A element. User can only click to go to this page,
     * without copy all link.
     * @param  string content Content to search for links.
     * @return string
     */
    this.replaceUrls = function(content) {
        var results = content.match(this.urlPattern);

        if(! results || ! results.length)
        {
            return content;
        }

        for(var i = 0; i < results.length; i++)
        {
            var href = results[i];

            // If has not http at the beginning, we add it manually
            if(/^https?:\/\//i.test(results[i]) == false)
            {
                href = 'http://' + results[i];
            }

            content = content.replace(results[i], '<a href="' + href + '" target="_blank">' + results[i] + '</a>');
        }

        return content;
    };

    /**
     * Appends message to box content.
     * @param  string from Author of message.
     * @param  string data Message content.
     * @param  string date Date of message.
     * @param  boolean prepend Prepends message?
     * @return self
     */
    this.appendMessage = function(from, data, date, prepend) {
        var elm = this.getContentScrollInfo();
        prepend = prepend || false;

        // We can scroll to bottom, only if user has scrolled content to bottom.
        // Otherwise we left scroll content not touched.
        var canScroll = elm.scrollHeight - elm.scrollTop === elm.clientHeight;
        data = this.replaceUrls(data);
        data = this.replaceSmileys(data);
        data = jQuery.trim(data);
        var message   = '<div class="bubble ' + (! from ? 'right' : 'left') + '" title="' + date + '">' + data.replace(/\n/g, '<br />') + '</div><div class="bubble-clear"></div>';

        if(prepend)
            this.content.find('.content').prepend(message);
        else
            this.content.find('.content').append(message);

        if(canScroll)
        {
            this.scrollContentBottom();
        }

        return this;
    };

    /**
     * Scrolls box content to bottom.
     * @return self
     */
    this.scrollContentBottom = function() {
        this.scrollContentTo(this.getContentScrollInfo().scrollHeight);

        return this;
    };

    /**
     * Scrolls box content to given value (in pixels).
     * @return self
     */
    this.scrollContentTo = function(to) {
        this.content.find('.content').scrollTop(to);

        return this;
    };

    /**
     * Returns object with informations about content scrolling.
     * @return object
     */
    this.getContentScrollInfo = function() {
        var elm = this.content.find('.content')[0];

        return {
            scrollHeight : elm.scrollHeight,
            scrollTop    : elm.scrollTop,
            clientHeight : elm.clientHeight
        };
    };

    /**
     * Updates status of box user.
     * @param integer status
     * @return self
     */
    this.setStatus = function(status) {
        if(status)
        {
            this.content.find('.headline .status').addClass('c');
        }
        if(! status)
        {
            this.content.find('.headline .status').removeClass('c');
        }

        return self;
    };

    /**
     * Shows content loader.
     * @return self
     */
    this.showContentLoader = function() {
        this.content.find('.content').addClass('loading');

        return this;
    };

    /**
     * Hides content loader.
     * @return self
     */
    this.hideContentLoader = function() {
        this.content.find('.content').removeClass('loading');

        return this;
    };

    /**
     * Sets focus on textarea.
     * @return self
     */
    this.setFocus = function() {
        this.clearNotifier();
        this.content.find('textarea').trigger('focus');
        this.focused = true;
        this.scrollContentBottom();

        return this;
    };

    this.hasFocus = function() {
        return this.focused;
    };

    /**
     * Returns HTML contant (jQuery object) of box.
     * @return jQuery
     */
    this.getContent = function() {
        return this.content;
    };

    /**
     * Shows box.
     * @return self
     */
    this.show = function() {
        this.content.removeClass('hd');
        this.opened = true;
        this.focused = true;
        this.setFocus();

        return this;
    };

    /**
     * Hides box.
     * @return self
     */
    this.hide = function() {
        this.content.addClass('hd');
        this.opened = false;
        this.focused = false;

        return this;
    };

    /**
     * Toggles visibility.
     * @return self
     */
    this.toggle = function() {
        if(this.opened)
        {
            this.hide();
        }
        else
        {
            this.show();
        }

        this.trigger('onBoxToggle', [this]);

        return this;
    };

    /**
     * Closes box, and remove it from document.
     * @return void
     */
    this.close = function() {
        this.trigger('onBoxClose', [this]);
        this.content.remove();
    };

    // Self create.
    this.init(options);
};
