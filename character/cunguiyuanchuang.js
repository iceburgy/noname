'use strict';
game.import('character',function(lib,game,ui,get,ai,_status){
	return {
		name:'cunguiyuanchuang',
		connect:true,
		character:{
			cun_zhugeliang:['male','shu',3,['reguanxing','kongcheng','reshensuan']],
		},
		characterIntro:{
			cun_zhugeliang:"村规原创，在原有基础上新增村规原创技能【神算】",
		},
		characterTitle:{},
		skill:{
			reshensuan:{
				audio:"guanxing",
				forced:true,
				locked:false,
				trigger:{
					player:"phaseDrawBegin1",
				},
				content:function (){
					"step 0"
					player.chooseBool("是否放弃摸牌改为获得【"+get.translation("reshensuan2")+"】？").ai=function(){
						return false;
					};
					"step 1"
					if(result.bool){
						trigger.num-=1;
						player.addTempSkill('reshensuan2',{player:'phaseUseAfter'});
						player.storage.reshensuan2=['basic','trick','equip'];
						player.markSkill('reshensuan2');
					}
				},
			},
			reshensuan2:{
				audio:"guanxing",
				enable:'phaseUse',
				marktext:'算',
				filter:function(event,player){
					return !player.hasSkill('reshensuan3')&&player.storage.reshensuan2&&player.storage.reshensuan2.length;
				},
				filterTarget:function(card,player,target){
					return true;
				},
				intro:{
					content:function(storage){
						if(storage&&storage.length) return '发动神算可用类别：'+get.translation(storage);
						else return '神算已用完'
					}
				},
				content:function (){
					"step 0"
					player.chooseControl(player.storage.reshensuan2).set('ai',function(){
						return player.storage.reshensuan2[Math.floor(Math.random()*player.storage.reshensuan2.length)];
					});
					"step 1"
					player.popup(result.control);
					game.log(player,'选择了【'+get.translation(result.control)+'】');
					var cards=get.cards(1);
					game.cardsGotoOrdering(cards);
					player.showCards(cards,get.translation('reshensuan2'));
					if(get.type(cards[0],'trick')==result.control){
						var bool=game.hasPlayer(function(current){
							return target.canUse(cards[0],current);
						});
						if(bool){
							target.chooseUseTarget(cards[0],true,false);
						}
						else{
							target.gain(cards,'gain2');
						}
						player.storage.reshensuan2.remove(result.control);
						player.markSkill('reshensuan2');

					}
					else{
						player.chooseToDiscard(1,'he',true);
						player.addTempSkill('reshensuan3',{player:'phaseUseAfter'});
						player.unmarkSkill('reshensuan2');
					}
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
			reshensuan_info:'摸牌阶段，你可以少摸一张牌。若如此做，出牌阶段的空闲时点，你可以声明牌的类别，并亮出牌堆顶的一张牌。若相同且此阶段未亮出过同名的牌，你指定一名角色，其使用之，如无法使用则改为获得之。否则你弃置一张牌，并且此技能无效直到此阶段结束。',
		},
	};
});
