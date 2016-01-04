@no-extends
<?php
    $opened = (isset($_COOKIE['chat-opened']) && $_COOKIE['chat-opened'] == 'yes' ? 'opened' : '');
?>
@if $opened == 'opened'
    <script>
        $('#page-wrapper').css('margin-right', 250);
    </script>
@endif
<div class="chat-sidebar <?php echo $opened; ?>">
    <div class="status">
        <div class="name">
            <span class="dot"></span>
            {{ $app->user()->getName() }}
        </div>
    </div>
    <div class="users">
        <div class="cooworkers">
            <h5>{{ t('modChatCooworkers') }}</h5>
            <ul>
                <?php foreach($app->repo('User', 'User')->findAll() as $i => $user): ?>
                    <?php if($app->user()->getId() != $user->getId()): ?>
                        <?php $name = trim($user->getName()) ? $user->getName() : $user->getUsername(); ?>
                        <li data-id="<?php echo $user->getId(); ?>" data-name="<?php echo $name; ?>"><div class="user-avatar" style="background-image:url('{{ $user->getAvatarUrl() }}');" data-avatar="{{ asset($user->getAvatarUrl()) }}"></div><span class="user-name"><?php echo $name; ?></span><span class="conn-dot"></span></li>
                    <?php endif; ?>
                <?php endforeach; ?>
            </ul>
        </div>
        <div class="widgets hidden">
            <h5>{{ t('modChatWidgets') }}</h5>
            <ul></ul>
        </div>
    </div>
    <div class="chat-status-container">
        <div class="chat-status">
            <h4>{{ t('modChatChangeStatus') }}</h4>
            <ul>
                <li class="on"><a href="#" data-status="connected"><i class="fa fa-circle"></i> {{ t('modChatStatusConnected') }}</a></li>
                <li class="off"><a href="#" data-status="disconnected"><i class="fa fa-circle"></i> {{ t('modChatStatusDisconnected') }}</a></li>
            </ul>
        </div>
    </div>
    @if ! $isRegistered
        <div class="chat-information-box">
            <button type="button" class="close" title="{{ t('close') }}">&times;</button>
            {{ t('modChatAppLooksLikeNotRegisteredInformation') }}
        </div>
    @endif
    <div class="settings">
        <a href="#" data-toggle="modal" data-target="#chat-settings-modal"><span>{{ t('modChatSettings') }}</span> <i class="fa fa-cog"></i></a>
    </div>
</div>

<div class="modal fade" id="chat-settings-modal" tabindex="-1" role="dialog" aria-labelledby="chat-settings-modal-label" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="{{ t('close') }}"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="chat-settings-modal-label">{{ t('modChatSettings') }}</h4>
            </div>
            <div class="modal-body">
                <h5>{{ t('modChatLoginAuto') }}</h5>
                <p>{{ t('modChatLoginAutoDescription') }}</p>
                <input type="checkbox" name="chat-connection-auto" value="1" />
                <h5>{{ t('modChatBrowserNotifications') }}</h5>
                <p>{{ t('modChatBrowserNotificationsDescription') }}</p>
                <input type="checkbox" name="chat-browser-notifications" value="1" />
                <h5>{{ t('modChatSoundNotificationVolume') }}</h5>
                <p>{{ t('modChatSoundNotificationVolumeDescription') }}</p>
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-md-4">
                            <input data-slider-id="chat-sound-volume-slider" name="chat-sound-volume" type="text" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="50"/>
                        </div>
                        <div class="col-md-8">
                            <button type="button" class="btn btn-small btn-default" id="chat-settings-sound-play">{{ t('modChatPlaySound') }} <i class="fa fa-play-circle"></i></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default btn-cancel" data-dismiss="modal">{{ t('close') }}</button>
            </div>
        </div>
    </div>
</div>

<script>
    $(function() {
        var ChatAPI = new ChatApi('<?php echo $app->openSettings('app')->get('mod.chat.ws'); ?>');

        ChatAPI.domain = '<?php echo $_SERVER['SERVER_NAME']; ?>';
        ChatAPI.appId  = '<?php echo $app->openSettings('app')->get('id'); ?>';
        ChatAPI.userId = '<?php echo $app->user()->getId(); ?>';
        ChatAPI.author = '<?php echo $app->user()->getName(); ?>';

        ChatAPI.init();

        var ChatAPP = new ChatApp(ChatAPI);
        ChatAPP.autologin = <?php echo $app->openSettings('user')->get('mod.chat.connection.autologin'); ?>;
        ChatAPP.showBrowserNotifications = <?php echo $app->openSettings('user')->get('mod.chat.notification.browsershow'); ?>;
        ChatAPP.soundVolume = <?php echo $app->openSettings('user')->get('mod.chat.sound.volume'); ?>;
        ChatAPP.init();

        var cs = new ChatSettings(ChatAPP);

        $('#chat-settings-modal').on('show.bs.modal', function() {
            if(! cs.initiated)
            {
                var waitingFor = 4;

                APP.Asset.css(APP.asset('/bootstrap-slider/css/bootstrap-slider.min.css'), function() { waitingFor--; });
                APP.Asset.js(APP.asset('/bootstrap-slider/bootstrap-slider.min.js'), function() { waitingFor--; });
                APP.Asset.css(APP.asset('/bootstrap-switch/bootstrap-switch.min.css'), function() { waitingFor--; });
                APP.Asset.js(APP.asset('/bootstrap-switch/bootstrap-switch.min.js'), function() { waitingFor--; });

                var timeout = setInterval(function() {
                    if(waitingFor <= 0)
                    {
                        cs.init();
                        clearInterval(timeout);
                    }
                }, 50);
            }
        });

        $('.chat-information-box .close').click(function() {
            $('.chat-information-box').remove();
        });
    });
</script>
