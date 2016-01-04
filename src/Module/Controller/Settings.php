<?php
/**
 * Verone CRM | http://www.veronecrm.com
 *
 * @copyright  Copyright (C) 2015 - 2016 Adam Banaszkiewicz
 * @license    GNU General Public License version 3; see license.txt
 */

namespace App\Module\Chat\Controller;

use CRM\App\Controller\BaseController;

class Settings extends BaseController
{
    public function saveAction($request)
    {
        $settings = $this->openSettings('user');

        $settings->set('mod.chat.connection.autologin', $request->get('connection_autologin'));
        $settings->set('mod.chat.notification.browsershow', $request->get('notification_browsershow'));
        $settings->set('mod.chat.sound.volume', $request->get('sound_volume'));

        return $this->responseAJAX([
            'status'  => 'success',
            'message' => $this->t('modChatSettingsSaved')
        ]);
    }
}
