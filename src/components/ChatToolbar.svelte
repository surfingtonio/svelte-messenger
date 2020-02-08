<script>
    export let user;
    export let usersCount = 0;
</script>

<div class="chat-toolbar">
    <div class="user">
        <img src="./images/avataaars-1.png" alt="" class="avatar" />
        <span class="username">{user.username}</span>
    </div>
    <div class="badge">Online users <span>{usersCount}</span></div>
</div>

<style>
    .chat-toolbar {
		display: flex;
		justify-content: space-between;
		background: var(--component-secondary-background);
		line-height: calc(var(--chat-toolbar-height) - (var(--chat-toolbar-padding-y) * 2));
        padding: var(--chat-toolbar-padding-y) var(--chat-toolbar-padding-x);
    }

	.chat-toolbar .badge {
        align-items: center;
        background: var(--badge-background);
        border-radius: var(--component-border-radius);
        border: var(--component-border-width) solid var(--component-line-color);
        color: #fff;
        display: flex;
        font-weight: 700;
        padding: var(--badge-padding-y) var(--badge-padding-x);
	}

	.chat-toolbar .badge > span {
        background: #fff;
        border-radius: var(--component-border-radius);
        color: #000;
        display: inline-block;
        line-height: 1;
        margin-left: var(--toolbar-separator-width);
        padding: var(--badge-span-padding-y) var(--badge-span-padding-x);
	}

	.chat-toolbar .user {
		display: flex;
		align-items: center;
	}

	.chat-toolbar .user .avatar {
		height: var(--chat-toolbar-height);
		margin-right: var(--toolbar-separator-width);
	}

	.chat-toolbar .user .username {
		font-size: 1.25rem;
		font-weight: 700;
		line-height:  var(--chat-toolbar-height);
	}
</style>