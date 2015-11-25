<?php
/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

namespace App\Module\Chat\Plugin;

use CRM\App\Module\Plugin;

class BaseView extends Plugin
{
    public function navbarLinks()
    {
        // We need load assets here, becouse in bodyEnd event is too late.
        $this->assetter()
            ->load('howler')
            ->load([
                'files' => [ 'js' => [ '{ROOT}/modules/Chat/chat-app.js' ], 'css' => [ '{ROOT}/modules/Chat/style.css' ] ]
            ]);

        return '<li'.(isset($_COOKIE['chat-opened']) && $_COOKIE['chat-opened'] == 'yes' ? ' class="active"' : '').'>
                <a href="#" class="mod-chat-toggle-chat">
                    <i class="fa fa-comments-o fa-fw"></i>
                </a>
            </li>';
    }

    public function bodyEnd()
    {
        return $this->get('templating.engine')->render('chatSidebar.Plugin.Chat');
    }
}
