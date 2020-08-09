'use strict';
decadeParts.import(function(lib, game, ui, get, ai, _status){
	decadeUI.skill = {
		chengxiang:{
			audio: 2,
			frequent: true,
			trigger: {
				player: 'damageEnd'
			},
			content: function() {
				'step 0'
				var cards = get.cards(4);
				var guanXing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, 4, false);
				guanXing.doubleSwitch = true;
				guanXing.caption = '【称象】';
				guanXing.header2 = '获得的牌';
				guanXing.callback = function(){
					var num = 0;
					for (var i = 0; i < this.cards[1].length; i++) {
						num += get.number(this.cards[1][i]);
					}
					
					return num > 0 && num <= 13;
				};
				
				game.broadcast(function(player, cards, callback){
					if (!window.decadeUI) return;
					var guanXing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, 4, false);
					guanXing.caption = '【称象】';
					guanXing.header2 = '获得的牌';
					guanXing.callback = callback;
				}, player, cards, guanXing.callback);
				
				var player = event.player;
				event.switchToAuto = function(){
					var cards = guanXing.cards[0];
					var num, sum, next;
					var index = 0;
					var results = [];
					
					for (var i = 0; i < cards.length; i++) {
						num = 0;
						sum = 0;
						next = i + 1;
						for (var j = i; j < cards.length; j++) {
							if (j != i && j < next)
								continue;
							
							num = sum + get.number(cards[j]);
							if (num <= 13) {
								sum = num;
								if (!results[index]) results[index] = [];
								results[index].push(cards[j]);
							}
							
							if (j >= cards.length - 1) index++;
						}
						
						if (results[index] && results[index].length == cards.length) break;
					}
					
					var costs = [];
					for (var i = 0; i < results.length; i++) {
						costs[i] = {
							value: 0,
							index: i,
						};
						for (var j = 0; j < results[i].length; j++) {
							costs[i].value += get.value(results[i][j], player);
							// 如果有队友且有【仁心】且血量不低，优先选择装备牌
							if (player.hasFriend() && player.hasSkill('renxin') && get.type(results[i][j]) == 'equip' && player.hp > 1) {
								costs[i].value += 5;
							}
							
							// 如果自己有延时牌且没有无懈可击，优先选择无懈可击
							if (player.node.judges.childNodes.length > 0 && !player.hasWuxie() && results[i][j] == 'wuxie') {
								costs[i].value += 5;
							}
						}
					}
					
					costs.sort(function(a, b) {
						return b.value - a.value;
					});
					
					var time = 500;
					var result = results[costs[0].index];
					
					for (var i = 0; i < result.length; i++) {
						setTimeout(function(move, finished){
							guanXing.move(move, guanXing.cards[1].length, 1);
							if (finished) guanXing.finishTime(1000);
						}, time, result[i], (i >= result.length - 1));
						time += 500;
					}
				};
				
				if (event.isOnline()) {
					event.player.send(function(){
						if (!window.decadeUI && decadeUI.eventDialog) _status.event.finish();
					}, event.player);
					
					event.player.wait();
					decadeUI.game.wait();
				} else if (!event.isMine()) {
					event.switchToAuto();
				}
				'step 1'
				if (event.result && event.result.bool) {
					game.cardsDiscard(event.cards1);
					player.gain(event.cards2, 'log', 'gain2');
				}
			},
			ai: {
				maixie: true,
				maixie_hp: true,
				effect: {
					target: function(card, player, target) {
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
							if (!target.hasFriend()) return;
							if (target.hp >= 4) return [1, 2];
							if (target.hp == 3) return [1, 1.5];
							if (target.hp == 2) return [1, 0.5];
						}
					}
				}
			}
		},
		xinfu_dianhua: {
			audio: 2,
			frequent: true,
			trigger: {
				player: ["phaseZhunbeiBegin", "phaseJieshuBegin"],
			},
			filter:function(event, player){
				for (var i = 0; i < lib.suit.length; i++) {
					if (player.hasMark('xinfu_falu_' + lib.suit[i])) return true;
				}
				return false;
			},
			content:function(){
				var num = 0;
				var player = event.player;
				for (var i = 0; i < lib.suit.length; i++) {
					if (player.hasMark('xinfu_falu_' + lib.suit[i])) num++;
				}
				
				var cards = get.cards(num);
				var dianhua = decadeUI.content.chooseGuanXing(player, cards, cards.length);
				dianhua.caption = '【点化】';
				game.broadcast(function(player, cards, callback){
					if (!window.decadeUI) return;
					var dianhua = decadeUI.content.chooseGuanXing(player, cards, cards.length);
					dianhua.caption = '【点化】';
					dianhua.callback = callback;
				}, player, cards, dianhua.callback);
				
				event.switchToAuto = function(){
					var cards = dianhua.cards[0].concat();
					var cheats = [];
					var judges;
					
					var next = player.getNext();
					var friend = player;
					if (event.triggername == 'phaseJieshuBegin') {
						friend = next;
						judges = friend.node.judges.childNodes;
						if (get.attitude(player, friend) < 0) friend = null;
					} else {
						judges = player.node.judges.childNodes;
					}
					
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
							dianhua.move(card, index, 0);
							if (finished) dianhua.finishTime(1000);
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
			},

		},
		identity_junshi: {
			name:'军师',
			mark:true,
			silent:true,
			intro:{ content:'准备阶段开始时，可以观看牌堆顶的三张牌，然后将这些牌以任意顺序置于牌堆顶或牌堆底' },
			trigger:{
				player:'phaseBegin'
			},
			content:function(){
				if (player.isUnderControl()) {
					game.modeSwapPlayer(player);
				}
				var num = 3;
				var cards = get.cards(num);
				var guanxing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length);
				guanxing.caption = '【军师】';
				game.broadcast(function(player, cards, callback){
					if (!window.decadeUI) return;
					var guanxing = decadeUI.content.chooseGuanXing(player, cards, cards.length, null, cards.length);
					guanxing.caption = '【军师】';
					guanxing.callback = callback;
				}, player, cards, guanxing.callback);
				
				event.switchToAuto = function(){
					var cards = guanxing.cards[0].concat();
					var cheats = [];
					var judges = player.node.judges.childNodes;

					if (judges.length) cheats = decadeUI.get.cheatJudgeCards(cards, judges, true);
					if (cards.length) {
						for (var i = 0; i >= 0 && i < cards.length; i++) {
							if (get.value(cards[i], player) >= 5) {
								cheats.push(cards[i]);
								cards.splice(i, 1)
							}
						}
					}
					
					var time = 500;
					for (var i = 0; i < cheats.length; i++) {
						setTimeout(function(card, index, finished){
							guanxing.move(card, index, 0);
							if (finished) guanxing.finishTime(1000);
						}, time, cheats[i], i, (i >= cheats.length - 1) && cards.length == 0);
						time += 500;
					}
					
					for (var i = 0; i < cards.length; i++) {
						setTimeout(function(card, index, finished){
							guanxing.move(card, index, 1);
							if (finished) guanxing.finishTime(1000);
						}, time, cards[i], i, (i >= cards.length - 1));
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
			},
		},
		wuxin:{
			audio: 2,
			trigger:{ 
				player:'phaseDrawBegin1' 
			},
			content:function(){
				var num = get.population('qun');
				if (player.hasSkill('huangjintianbingfu')) {
					num += player.storage.huangjintianbingfu.length;
				}
				
				var cards = get.cards(num);
				var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length);
				dialog.caption = '【悟心】';
				game.broadcast(function(player, cards, callback){
					if (!window.decadeUI) return;
					var dialog = decadeUI.content.chooseGuanXing(player, cards, cards.length);
					dialog.caption = '【悟心】';
					dialog.callback = callback;
				}, player, cards, dialog.callback);
				
				event.switchToAuto = function(){
					var cards = dialog.cards[0].concat();
					var cheats = [];
					
					var next = player.getNext();
					var friend = player;
					var judges = friend.node.judges.childNodes;
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
			},
		},
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
