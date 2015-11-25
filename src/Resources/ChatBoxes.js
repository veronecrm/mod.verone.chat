/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

var ChatBoxes = function() {
    this.boxes = [];
    this.container = $([]);

    this.init = function() {
        $('body').append('<div class="chat-boxes"></div>');

        this.container = $('.chat-boxes');

        var self = this;

        this.container = $('.chat-boxes');

        // Remove box by press ESC
        $('body').keydown(function(e) {
            if(e.which === 27)
            {
                var box = self.getFocusedBox();

                if(box)
                {
                    self.removeBox(box.id);
                }
            }
        })
    };

    /**
     * Creates box with given options and returns its object.
     * @param  object options Box options.
     * @return ChatBox
     */
    this.createBox = function(options) {
        var self = this;

        options = $.extend({
            title     : 'Box title',
            contents  : [],
            id        : 'uniqId-' + Math.random(),
            isWidget  : false,
            status    : 0,
            opened    : true
        }, options);

        var box = new ChatBox(options);

        self.container.append(box.getContent());
        self.boxes.push(box);

        box.getContent().click(function(e) {
            self.releaseBoxesFocus();

            /**
             * We set focused only when box is opened, becouse otherwise
             * when notifier is called, nothing is done - notifier have information
             * that box is focused.
             */
            if(box.opened)
            {
                box.focused = true;
            }

            box.clearNotifier();

            e.stopPropagation();
        });

        box.getContent().find('.headline i.close-box').click(function() {
            self.removeBox(box.id);
        });

        $('body').mousedown(function() {
            self.releaseBoxesFocus();
        });

        return box;
    };

    /**
     * Remove Box by given ID from collection, and from document.
     * @param  string id Box ID
     * @return self
     */
    this.removeBox = function(id) {
        var box = this.findBoxById(id);
        var boxes = [];

        for(var i in this.boxes)
        {
            if(this.boxes[i].id != id)
            {
                boxes.push(this.boxes[i]);
            }
        }

        this.boxes = boxes;

        if(box)
            box.close();

        return this;
    };

    /**
     * Returns all created boxes.
     * @return array
     */
    this.getBoxes = function() {
        return this.boxes;
    };

    /**
     * Set all boxes to not focused.
     * @return self
     */
    this.releaseBoxesFocus = function() {
        for(var i in this.boxes)
        {
            if(this.boxes[i])
            {
                this.boxes[i].focused = false;
            }
        }

        return this;
    };

    /**
     * Checks if any of creates boxes are focused.
     * @return boolean
     */
    this.anyBoxFocused = function() {
        for(var i in this.boxes)
        {
            if(this.boxes[i].focused == true)
            {
                return true;
            }
        }

        return false;
    };

    this.getFocusedBox = function() {
        for(var i in this.boxes)
        {
            if(this.boxes[i].focused == true)
            {
                return this.boxes[i];
            }
        }

        return null;
    };

    /**
     * Finds box by given ID.
     * @param  string id Box ID.
     * @return ChatBox
     * @return null
     */
    this.findBoxById = function(id) {
        for(var i in this.boxes)
        {
            if(this.boxes[i].id == id)
            {
                return this.boxes[i];
            }
        }

        return null;
    };

    /**
     * Check if box with given ID exists in boxes list.
     * @param  string id Box ID.
     * @return boolean
     */
    this.boxExists = function(id) {
        for(var i in this.boxes)
        {
            if(this.boxes[i].id == id)
            {
                return true;
            }
        }

        return false;
    };
};
