'use strict';
decadeParts.import(function(lib, game, ui, get, ai, _status){
	decadeUI.skill = {
	};
	
	decadeUI.inheritSkill = {
		nk_shekong: {
			content:function(){
				'step 0'
				event.cardsx = cards.slice(0);
				var num = get.cnNumber(cards.length);
				var trans = get.translation(player);
				var prompt = ('弃置' + num + '张牌，然后' + trans + '摸一张牌');
				if (cards.length > 1) prompt += ('；或弃置一张牌，然后' + trans + '摸' + num + '张牌');
				var next = target.chooseToDiscard(prompt, 'he', true);
				next.numx = cards.length;
				next.selectCard = function() {
					if (ui.selected.cards.length > 1) return _status.event.numx;
					return [1, _status.event.numx];
				};
				next.complexCard = true;
				next.ai = function(card) {
					if (ui.selected.cards.length == 0 || (_status.event.player.countCards('he',
					function(cardxq) {
						return get.value(cardxq) < 7;
					}) >= _status.event.numx)) return 7 - get.value(card);
					return - 1;
				};
				'step 1'
				if (result.bool) {
					if (result.cards.length == cards.length) player.draw();
					else player.draw(cards.length);
					event.cardsx.addArray(result.cards);
					for (var i = 0; i < event.cardsx.length; i++) {
						if (get.position(event.cardsx[i]) != 'd') event.cardsx.splice(i--, 1);
					}
				} else event.finish();
				'step 2'
				if (event.cardsx.length) {
					var cards = event.cardsx;
					var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length);
					dialog.caption = '【设控】';
					game.broadcast(function(player, cards, callback){
						if (!window.decadeUI) return;
						var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length);
						dialog.caption = '【设控】';
						dialog.callback = callback;
					}, player, cards, dialog.callback);
					
					event.switchToAuto = function(){
						var cards = dialog.cards[0].concat();
						var cheats = [];
						var judges;
						
						var next = player.getNext();
						var friend = (get.attitude(player, next) < 0) ? null : next;
						judges = next.node.judges.childNodes;
						
						if (judges.length > 0) cheats = decadeUI.get.cheatJudgeCards(cards, judges, friend != null);
						
						if (friend) {
							cards = decadeUI.get.bestValueCards(cards, friend);
						} else {
							cards.sort(function(a, b){
								return get.value(a, next) - get.value(b, next);
							});
						}

						cards = cheats.concat(cards);
						var time = 500;
						for (var i = 0; i < cards.length; i++) {
							setTimeout(function(card, index, finished){
								dialog.move(card, index, 0);
								if (finished) dialog.finishTime(cards.length <= 1 ? 250 : 1000);;
							}, time, cards[i], i, i >= cards.length - 1);
							time += 500;
						}
					}
					
					if (event.isOnline()) {
						event.player.send(function(){
							if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
						}, event.player);
						
						event.player.wait();
						decadeUI.game.wait();
					} else if (!event.isMine()) {
						event.switchToAuto();
					}
				} else event.finish();
			}
		},
	}
	
	for (var key in decadeUI.skill) {
		if (lib.skill[key]) lib.skill[key] = decadeUI.skill[key];
	}

	for (var key in decadeUI.inheritSkill) {
		if (lib.skill[key]) {
			 for (var j in decadeUI.inheritSkill[key]) {
				lib.skill[key][j] = decadeUI.inheritSkill[key][j]
			 }
		}
	}

	var muniuSkill = lib.skill['muniu_skill'];
	if (muniuSkill) {
		muniuSkill.sync = function(muniu){
			if(game.online){
				return;
			}
			if(!muniu.cards){
				muniu.cards=[];
			}
			for(var i=0;i<muniu.cards.length;i++){
				var parent = muniu.cards[i].parentNode;
				if(!parent || (parent.id != 'special' && !parent.classList.contains('special'))){
					muniu.cards[i].classList.remove('selected');
					muniu.cards[i].classList.remove('selectable');
					muniu.cards[i].classList.remove('un-selectable');
					muniu.cards.splice(i--,1);
				}
			}
			game.broadcast(function(muniu,cards){
				muniu.cards=cards;
			},muniu,muniu.cards);
		};
	}
});
