/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

var ChatStorage = function() {
    this.widgets = [];
    this.boxes   = [];

    this.init = function() {
        if(typeof(Storage) == "undefined")
        {
            alert("Sorry, your browser does not support Web Storage...");
            return false;
        }

        this.widgets = localStorage.getItem('chat-widgets');

        if(! this.widgets)
        {
            this.widgets = [];
        }
        else
        {
            this.widgets = JSON.parse(this.widgets);
        }

        this.boxes = localStorage.getItem('chat-boxes');

        if(! this.boxes)
        {
            this.boxes = [];
        }
        else
        {
            this.boxes = JSON.parse(this.boxes);
        }

        return true;
    };

    this.getWidgets = function() {
        return this.widgets;
    };

    this.appendWidget = function(id, name) {
        this.widgets.push({'id': id, 'name': name});

        localStorage.setItem('chat-widgets', JSON.stringify(this.widgets));

        return this;
    };

    this.removeWidget = function(id) {
        var result = [];

        for(var i in this.widgets)
        {
            if(this.widgets[i].id != id)
            {
                result.push(this.widgets[i]);
            }
        }

        this.widgets = result;

        localStorage.setItem('chat-widgets', JSON.stringify(this.widgets));
    };

    this.getBoxes = function() {
        return this.boxes;
    };

    this.appendBox = function(box) {
        var founded = false;

        for(var i in this.boxes)
        {
            if(this.boxes[i].id == box.id)
            {
                this.boxes[i] = box;
                founded = true;
            }
        }

        if(founded === false)
        {
            this.boxes.push(box);
        }

        localStorage.setItem('chat-boxes', JSON.stringify(this.boxes));

        return this;
    };

    this.findBox = function(id) {
        for(var i in this.boxes)
        {
            if(this.boxes[i].id == id)
            {
                return this.boxes[i];
            }
        }

        return null;
    };

    this.updateBox = function(id, box) {
        var result = [];

        for(var i in this.boxes)
        {
            if(this.boxes[i].id == id)
            {
                result.push(box);
            }
            else
            {
                result.push(this.boxes[i]);
            }
        }

        this.boxes = result;

        localStorage.setItem('chat-boxes', JSON.stringify(this.boxes));
    };

    this.removeBox = function(id) {
        var result = [];

        for(var i in this.boxes)
        {
            if(this.boxes[i].id != id)
            {
                result.push(this.boxes[i]);
            }
        }

        this.boxes = result;

        localStorage.setItem('chat-boxes', JSON.stringify(this.boxes));
    };
};
