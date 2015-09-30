var create_template = function(from_user, to_user, image_url){
    if (!image_url) {
        image_url = '/static/images/user.png';
    }
    var t = '<div class="pull-left">' +
                '<a onclick="return false">' +
                    '<center><img class="media-object img-min" alt="avatar" src="' + image_url +'" width="30px"></center>'+
                    '<center><strong class="media-heading ng-binding">' + from_user["username"] + '</strong></center>'+
                '</a>'+
            '</div>'+
            '<div class="media-body text-center">'+
                '<button class="btn btn-link btn-block invite-accept" from_user="' + from_user["id"] + '" to_user="' + to_user["id"] + '">Accept invite</button>'+
            '</div>';
    return t
};

function generateID(){
    var d = new Date().getTime();
    var id = 'xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return id;
}



var add_event = function(eventHTML){
    $('#noEV').remove();
    var ev_list = $("#event_list");
    var media_list = $('.media-list', ev_list);

    if (eventHTML != '<li class="animate" id="noEV">No events</li>'){
        $('#noEV').remove();
        var randomId = generateID();
        var item = '<li class="media animate" id="' + randomId + '">' + eventHTML + '</li>';
        media_list.append(item);
        $('.fixed-box').css("opacity", 1);

        setTimeout(function(){
            $('#'+randomId).remove();
            console.log(media_list.length);
            if ($('li', media_list).length < 1){
                add_event('<li class="animate" id="noEV">No events</li>');
                $('.fixed-box').css("opacity", 0.4);
            }
        }, 7000);
    }
    else{
        media_list.append(eventHTML);
        $('.fixed-box').css("opacity", 0.4);
    }

    $('.invite-accept').unbind('click');
    $('.invite-accept').on('click', function(){
        var from_user = $(this).attr('from_user');
        var to_user = $(this).attr('to_user');
        socket.emit("invite_accept", {"from_user": from_user, "to_user": to_user});
    });


};

