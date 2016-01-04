/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 - 2016 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

/**
 * Full API for Chat Client connection.
 * @param string host Server host name.
 */
var ChatApi = function(host) {
    /**
     * Connection with WebSocketServer.
     * @type {WebSocketServer}
     */
    this.ws = null;

    /**
     * Stores EventDispacher.
     * @type EventDispatcher
     */
    this.dispatcher = null;

    /**
     * Host name of chat.
     * @type {String}
     */
    this.host = host;

    /**
     * Stores AppID.
     * @type string
     */
    this.appId  = '';

    /**
     * Stores domain.
     * @type string
     */
    this.domain = '';

    /**
     * Stores user ID.
     * @type string
     */
    this.userId = '';

    /**
     * Connection is opened?
     * @type boolean
     */
    this.opened = false;

    /**
     * Stores time of last sended message.
     * @type integer
     */
    this.lastMessageTime = 0;

    /**
     * Time between every ping message.
     * @type integer
     */
    this.pingSleepTime = 5000;

    /**
     * Stores interval of Ping sended to server for maintain connection
     * @type integer
     */
    this.pingInterval = null;

    /**
     * Inits API.
     */
    this.init = function() {
        // AppId
        ChatCookieHelper.set('_sg_taa', this.appId, 10);
        // UserID
        ChatCookieHelper.set('_sg_tab', this.userId, 10);
        // Domain
        ChatCookieHelper.set('_sg_tac', this.domain, 10);
        // Current Session ID
        ChatCookieHelper.set('_sg_tay', '111111111111', 10);
        // new Session ID
        ChatCookieHelper.set('_sg_taz', '222222222222', 10);

        this.dispatcher = new EventDispatcher;
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
     * Open connection with Chat server.
     * @return boolean
     */
    this.open = function() {
        if(! "WebSocket" in window)
        {
            alert('Oh no, you need a browser that supports WebSockets!');
            return false;
        }

        try {
            this.ws  = new WebSocket(this.host + '?_sg_taa=' + this.appId + '&_sg_tab=' + this.userId + '&_sg_tac=' + this.domain + '&_sg_tay=111111111111&_sg_taz=222222222222');
            var self = this;

            this.ws.onopen = function() {
                console.log('Socket Status: ' + self.ws.readyState + ' (Open)');

                self.pingInterval = setInterval(function() {
                    var ct = new Date().getTime();

                    if(! self.lastMessageTime || self.lastMessageTime < ct - self.pingSleepTime)
                    {
                        self.ping();
                        self.lastMessageTime = ct;
                    }
                }, 1000);

                self.opened = true;
                self.trigger('onOpen', [self.ws]);
            }

            this.ws.onmessage = function(msg) {
                console.log('Socket Message: ' + msg);
                var result = jQuery.parseJSON(msg.data);

                if(result.event == 'message')
                {
                    self.trigger('onIncommingMessage', [result, self.ws]);
                }
                else
                {
                    self.trigger('onStatus', [result, self.ws]);
                }
            }

            this.ws.onclose = function() {
                console.log('Socket Status: ' + self.ws.readyState + ' (Closed)');
                self.opened = false;
                self.trigger('onClose', [self.ws]);
                clearInterval(self.pingInterval);
            }
        }
        catch(exception)
        {
            alert('Socket Error: ' + exception)
            console.log('Socket Error: ' + exception);
        }

        return true;
    };

    /**
     * Close connection.
     * @return self
     */
    this.close = function() {
        this.ws.close();
        clearInterval(this.pingInterval);

        return this;
    };

    /**
     * Sends data to receiver.
     * @param  {string} receiver Receiver name - UserID or 'System'.
     * @param  {string} event    Event name.
     * @param  {Object} dataSrc  Data to submit
     * @return {Void}
     */
    this.send = function(receiver, event, dataSrc) {
        // Default data object
        var dataRes = {
            event: event,
            data:  ''
        };
        
        // Extending data
        for(var i in dataSrc)
        {
            if(dataSrc.hasOwnProperty(i))
            {
                dataRes[i] = dataSrc[i];
            }
        }

        if(! this.ws)
        {
            return false;
        }

        // Send message
        this.ws.send(JSON.stringify(dataRes));

        // Event
        if(event == 'message')
        {
            this.trigger('onOutgoingMessage', [dataRes]);
        }
    };

    /**
     * Send text message to specific user.
     * @param  string to      User ID to which we send message.
     * @param  string message Message to send.
     * @return self
     */
    this.sendMessage = function(to, message) {
        this.send(to, 'message', {
            data: message,
            from: this.userId,
            to:   to
        });

        return this;
    };

    /**
     * Send ping to server.
     * @return self
     */
    this.ping = function() {
        this.send('*', 'ping', {});

        return this;
    };
};
