'use strict';
game.import('character',function(lib,game,ui,get,ai,_status){
	return {
		name:'cunguiyuanchuang',
		connect:true,
		character:{
			cun_zhugeliang:['male','shu',3,['reguanxing','kongcheng','reshensuan']],
		},
		characterIntro:{
			cun_zhugeliang:"村诸葛亮，村规原创，在原有基础上新增村规原创技能【神算】",
		},
		characterTitle:{},
		skill:{
			reshensuan:{
				audio:2,
				trigger:{player:'phaseUseBegin'},
				filter:function(event,player){
					return player.countCards('he')>0;
				},
				content:function (){
					"step 0"
					player.chooseToDiscard(1,'he',true);
					player.addTempSkill('reshensuan2',{player:'phaseUseAfter'});
					player.storage.reshensuan2=[];
					player.markSkill('reshensuan2');
				},
				check:function(event,player){return false},
			},
			reshensuan2:{
				audio:['reshensuan',2],
				enable:'phaseUse',
				marktext:'算',
				filter:function(event,player){
					return !player.hasSkill('reshensuan3');
				},
				intro:{
					content:function(storage){
						if(storage&&storage.length) return '发动神算已用牌名：'+get.translation(storage);
						else return '尚未使用神算'
					}
				},
				content:function (){
					"step 0"
					player.chooseControl(['basic','trick','equip']).set('ai',function(){
						return player.storage.reshensuan2[Math.floor(Math.random()*player.storage.reshensuan2.length)];
					});
					"step 1"
					player.popup(result.control);
					game.log(player,'选择了【'+get.translation(result.control)+'】');
					var cards=get.cards(1);
					var name=get.name(cards[0]);
					event.cards=cards;
					event.cardsname=name;
					game.cardsGotoOrdering(cards);
					player.showCards(cards,get.translation('reshensuan2'));
					if(get.type(cards[0],'trick')==result.control&&!player.storage.reshensuan2.contains(name)){
						player.chooseTarget(true,'选择使用或者获得此牌的角色').set('ai',function(target){
							var att=get.attitude(_status.event.player,target);
							if(_status.event.du){
								if(target.hasSkillTag('nodu')) return 0.5;
								return -att;
							}
							if(att>0){
								if(_status.event.player!=target) att+=2;
								return att+Math.max(0,5-target.countCards('h'));
							}
							return att;
						}).set('du',name=='du');
					}
					else{
						player.chooseToDiscard(1,'he',true);
						player.addTempSkill('reshensuan3',{player:'phaseUseAfter'});
						event.finish();
					}
					'step 2'
					var target=result.targets[0];
					var bool=game.hasPlayer(function(current){
						return target.canUse(event.cards[0],current);
					})&&target.getCardUsable(event.cardsname)>0;
					if(bool){
						target.chooseUseTarget(event.cards[0],true,true);
					}
					else{
						target.gain(event.cards,'gain2');
					}
					player.storage.reshensuan2.add(event.cardsname);
					player.markSkill('reshensuan2');
				},
				ai:{
					order:0,
					result:{player:0},
				},
				onremove:function(player){
					player.unmarkSkill('reshensuan2');
				},
			},
			reshensuan3:{},
		},
		translate:{
			cunguiyuanchuang:'村规原创',
			cun_zhugeliang:'村诸葛亮',
			reshensuan:'神算',
			reshensuan2:'神算',
			reshensuan_info:'出牌阶段开始时，你可以弃置一张牌。若如此做，出牌阶段的空闲时点，你可以声明牌的类别，并亮出牌堆顶的一张牌。若相同且此阶段未亮出过同名的牌，你指定一名角色，其使用此牌，不能使用则获得。否则你弃置一张牌，然后此技能无效直到此阶段结束。',
		},
	};
});
