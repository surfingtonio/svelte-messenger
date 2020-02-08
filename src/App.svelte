<script>
	import { onMount } from 'svelte';
	import io from 'socket.io-client';
	import ChatWindow from './components/ChatWindow.svelte';
	import ChatToolbar from './components/ChatToolbar.svelte';
	import AjaxLoader from './components/AjaxLoader.svelte';

	let user = {};
	let usersCount;
	let chats = [];
	let loading = true;
	let timeout;
	let keyboardActivity = false;

	const socket = io('/chatrooms');

	function handleMessageReceive(event) {
		socket.emit('messagereceive', event.detail);
	}

	function handlekeyboardActivity(event) {
		socket.emit('keyboardActivity', user);
	}

	$: if(keyboardActivity) {
		if(timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => keyboardActivity = false, 2000);
	}

	socket.on('userleave', user => {
		usersCount--;
	});

	socket.on('userregister', registeredUser => user = registeredUser);

	socket.on('userjoin', data => usersCount = Object.keys(data.users).length);

	socket.on('messagereceive', chat => chats = [...chats, chat]);

	socket.on('keyboardActivity', users => keyboardActivity = true);

	onMount(() => {
		fetch('https://uinames.com/api/?minlen=4&region=canada')
		.then(res => {
			loading = false;
			res.json()
			.then(user => {
				user = {
					id: new Date().getTime(),
					username: `${user.name} ${user.surname}`,
					avatar: `./images/avatar-${user.gender}.png`
				}
				socket.emit('userregister', user);
			})
			.catch(err => {
				user = {
					id: new Date().getTime(),
					username: `John Doe`,
					avatar: `./images/avatar-male.png`
				}
				socket.emit('userregister', user);
			});
		});
	});
</script>

<div class="container">
	{#if loading}
		<AjaxLoader />
	{:else}
		<div class="chat-toolbar-wrapper">
			<ChatToolbar {user} {usersCount} />
		</div>
		<div class="chat-window-wrapper">
			<ChatWindow {user} {chats} {keyboardActivity} on:incomingMessage={handleMessageReceive} on:keyboardActivity={handlekeyboardActivity} />
		</div>
	{/if}
</div>
<p class="not-supported">Screen not supported</p>

<style>
	:global(:root) {
		--chat-controls-height: 3rem;
		--chat-controls-padding-x: .25rem;
		--chat-controls-padding-y: .25rem;
		--chat-input-padding-x: .25rem;
		--chat-input-padding-y: .5rem;
		--chat-item-margin: .5rem 0;
		--chat-item-padding-x: 1rem;
		--chat-item-padding-y: 0;
		--chat-items-max-width: 100vw;
		--chat-items-min-width: 480px;
		--chat-toolbar-height: 3rem;
		--chat-toolbar-padding-x: 1rem;
		--chat-toolbar-padding-y: .5rem;
		--component-border-radius: .25rem;
		--component-border-width: 1px;
		--component-line-color: #e4e9f2;
		--component-max-height: 100%;
		--component-max-width: 100%;
		--component-min-width: 480px;
		--component-primary-background: #fff;
		--component-primary-color: #101010;
		--component-secondary-background: #f5f6f8;
		--component-secondary-color: #97a4b2;
		--component-small-font: .75rem;
		--component-theme-background: #7360f2;
		--message-border-radius: 1rem;
		--message-max-width: 30rem;
		--message-other-color: #efefef;
		--message-padding-x: 1rem;
		--message-padding-y: .5rem;
		--message-you-color: #d8ebff;
		--scrollbar-thumb-border-radius: .2rem;
		--scrollbar-thumb-color: rgba(228, 228, 228, .5);
		--scrollbar-thumb-hover-color: rgba(228, 228, 228, 1);
		--scrollbar-track-background: transparent;
		--scrollbar-width: .5rem;
		--toolbar-separator-width: .25rem;
	}

	:root {
		--chat-toolbar-outer-height: calc(var(--chat-toolbar-height) + (var(--chat-toolbar-padding-y) * 2));
	}

	.not-supported {
		display: none;
	}

	.container {
		height: 100%;
		width: 100%;
	}

	.chat-toolbar-wrapper {
		height: var(--chat-toolbar-outer-height);
	}

	.chat-window-wrapper {
		height: calc(100vh - var(--chat-toolbar-outer-height));
	}


	@media (max-width: 320px) {
		.container {
			display: none;
		}

		.not-supported {
			align-items: center;
			display: flex;
			height: 100vh;
			justify-content: center;
			width: 100vw;
			white-space: nowrap;
		}
	}
</style>