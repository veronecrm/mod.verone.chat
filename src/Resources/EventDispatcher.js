/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 - 2016 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

/**
 * Object of EventDispacher.
 */
var EventDispatcher = function() {
    /**
     * Stores listeners registered for some events.
     * @type array
     */
    this.listeners = [];

    /**
     * Bind Listener for given Event name.
     * @param  string   event    Event name.
     * @param  callable listener Listener callable.
     * @return self
     */
    this.bind = function(event, listener) {
        this.listeners.push({'event': event, 'listener': listener});

        return this;
    };

    /**
     * Triggers given event name, and pass params to listener, as its arguments.
     * @param  string event  Event name.
     * @param  array  params Array of params to pass to Listener.
     * @return self
     */
    this.trigger = function(event, params) {
        for(var i in this.listeners)
        {
            if(this.listeners[i].event === event)
            {
                this.listeners[i].listener.apply(this.listeners[i].listener, params);
            }
        }

        return this;
    };
};
