/*
   Copyright 2020 AryToNeX

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
'use strict';

const Module = require('../module.js');
const SWCA = require("../native/win32_swca/swca.js");

module.exports = class Win32 extends Module{
	static isCore = true;
	static platform = ['win32'];
	cssProps = ["--glasscord-win-blur", "--glasscord-win-performance-mode"];
	
	constructor(main){
		super(main);
		this.swca = new SWCA(this.main.win);
		this._type = 'none';
		this._performance_mode = true;
		const lessCostlyBlurWin = Win32.debounce(() => {this._apply('blurbehind')}, 50, true);
		const moreCostlyBlurWin = Win32.debounce(() => {this._apply('acrylic')}, 50);
		this.main.win.on('move', () => {
			if(this._type == 'acrylic' && this._performance_mode){
				lessCostlyBlurWin();
				moreCostlyBlurWin();
			}
		});
		this.main.win.on('resize', () => {
			if(this._type == 'acrylic' && this._performance_mode){
				lessCostlyBlurWin();
				moreCostlyBlurWin();
			}
		});
	}
	
	update(cssProp, value){
		switch(cssProp){
			case "--glasscord-win-blur":
				if(value) this._type = value;
				else this._type = 'none';
				this._apply(this._type);
				break;
			case "--glasscord-win-performance-mode":
				if(value){
					switch(value){
						case "true":
						default:
							this._performance_mode = true;
							break;
						case "false":
							this._performance_mode = false;
							break; 
						}
					return;
				}
				this._performance_mode = true;
				break;
		}
	}
	
	_apply(type){
		switch(type){
			case 'acrylic':
				this.swca.setAcrylic(0x00000001);
				break;
			case 'blurbehind':
				this.swca.setBlurBehind(0x00000000);
				break;
			case 'transparent':
				this.swca.setTransparentGradient(0x00000000);
				break;
			case 'none':
			default:
				this.swca.disable(0xff000000);
				break;
		}
	}
	
	/**
	 * Debounce function
	 * Might come in handy, given all those bouncy events!
	 */
	static debounce(func, wait, immediate){
		var timeout;
		return function() {
			var context = this, args = arguments;
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			}, wait);
			if (callNow) func.apply(context, args);
		};
	}
}
