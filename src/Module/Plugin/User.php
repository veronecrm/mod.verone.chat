<?php
/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 - 2016 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

namespace App\Module\Chat\Plugin;

use CRM\App\Module\Plugin;

class User extends Plugin
{
    public function login()
    {
        /**
         * This cookie allows Chat API in JS check, if user just logged in. If yes,
         * APP can connect automatically to chat server without user manual ingerention.
         */
        setcookie('chat-first-request', '1', time() + 60);
    }
}
