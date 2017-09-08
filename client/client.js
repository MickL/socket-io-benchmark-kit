$(function () {
    let socket;

    $('#btn-connect').click(() => {
        console.log('Connecting ...');

        const url = $('#input-url').val();
        socket = io(url);

        socket.on('connect', () => {
            console.log(`Connected to ${url} with id: ${socket.id}`);
            $('#connect').hide();
            $('#connection').show();
            $('#connected-info').show();
            $('#alert').hide();
            $('#emit-container').show();
        });

        socket.on('disconnect', reason => {
            console.log(`Disconnected. Reason: ${reason}`);
            $('#connected-info').hide();
            $('#emit-container').hide();
            $('#alert').show().html(`Disconnected. Reason: <i>${reason}</i>. Trying to reconnect...`);
        });

        socket.on('message', msg => {
            console.log(`Received a message from server: ${msg}`);

            $('#message-results').prepend(`
                <div class="message">
                    <span class="text-muted">${moment().format('HH:mm:ss')}</span> ${msg}
                </div>
            `)
        });
    });

    $('#btn-emit').click(() => {
        emit();
    });

    $('#input-msg').keypress(e => {
        if (e.which === 13) {
            emit();
        }
    });

    let emit = () => {
        const msg = $('#input-msg').val();
        console.log(`Sending message to the server: ${msg}`);
        socket.emit('message', msg);
        $('#input-msg').val('');
    }
});