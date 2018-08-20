import { Dom } from './d2l-dom.js';
import '../fastdom/fastdom.js';
import '../@polymer/polymer/lib/legacy/polymer-fn.js';

const $_documentContainer = document.createElement('template');
$_documentContainer.setAttribute('style', 'display: none;');

$_documentContainer.innerHTML = `<dom-module id="d2l-visible-on-ancestor-styles">
	<template>
		<style>
			:host([d2l-visible-on-ancestor-transition]) {
				transition: transform 200ms ease-out, opacity 200ms ease-out !important;
			}
			:host([d2l-visible-on-ancestor-hide]) {
				opacity: 0 !important;
				transform: translateY(-10px) !important;
			}
		</style>
	</template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

/** @polymerBehavior */
export const VisibleOnAncestorBehavior = {

	properties: {

		/**
			 * Whether the element is only visible when hovered or focus is within ancestor with 'd2l-visible-on-ancestor-target'.
			 */
		visibleOnAncestor: {
			type: Boolean,
			observer: '__voaHandleVisibleOnAncestor',
			reflectToAttribute: true
		}

	},

	detached: function() {
		this.__voaUninit();
	},

	__voaHandleBlur: function(e) {
		if (Dom.isComposedAncestor(this.__voaTarget, e.relatedTarget)) {
			return;
		}
		this.__voaFocusIn = false;
		this.__voaHide();
	},

	__voaHandleFocus: function() {
		this.__voaFocusIn = true;
		this.__voaShow();
	},

	__voaHandleHideEnd: function(e) {
		if (e.propertyName !== 'transform') {
			return;
		}
		this.removeEventListener('transitionend', this.__voaHandleHideEnd);
		fastdom.mutate(function() {
			this.removeAttribute('d2l-visible-on-ancestor-transition');
		}.bind(this));
	},

	__voaHandleMouseEnter: function() {
		this.__voaMouseOver = true;
		this.__voaShow();
	},

	__voaHandleMouseLeave: function() {
		this.__voaMouseOver = false;
		this.__voaHide();
	},

	__voaHandleShowEnd: function(e) {
		if (e.propertyName !== 'transform') {
			return;
		}
		this.removeEventListener('transitionend', this.__voaHandleShowEnd);
		fastdom.mutate(function() {
			this.removeAttribute('d2l-visible-on-ancestor-transition');
		}.bind(this));
	},

	__voaHandleVisibleOnAncestor: function(newValue, oldValue) {
		if (newValue) {
			requestAnimationFrame(function() {
				this.__voaInit();
			}.bind(this));
		} else if (oldValue) {
			this.__voaUninit();
		}
	},

	__voaHide: function() {
		if (this.__voaFocusIn || this.__voaMouseOver) return;
		fastdom.mutate(function() {
			this.addEventListener('transitionend', this.__voaHandleHideEnd);
			this.setAttribute('d2l-visible-on-ancestor-transition', 'd2l-visible-on-ancestor-transition');
			this.setAttribute('d2l-visible-on-ancestor-hide', 'd2l-visible-on-ancestor-hide');
		}.bind(this));
	},

	__voaInit: function() {

		this.__voaTarget = D2L.Dom.findComposedAncestor(this, function(node) {
			if (!node || node.nodeType !== 1) return false;
			return (node.classList.contains('d2l-visible-on-ancestor-target'));
		});
		if (!this.__voaTarget) return;

		this.__voaHandleBlur = this.__voaHandleBlur.bind(this);
		this.__voaHandleFocus = this.__voaHandleFocus.bind(this);
		this.__voaHandleMouseEnter = this.__voaHandleMouseEnter.bind(this);
		this.__voaHandleMouseLeave = this.__voaHandleMouseLeave.bind(this);
		this.__voaHandleHideEnd = this.__voaHandleHideEnd.bind(this);
		this.__voaHandleShowEnd = this.__voaHandleShowEnd.bind(this);

		this.__voaTarget.addEventListener('focus', this.__voaHandleFocus, true);
		this.__voaTarget.addEventListener('blur', this.__voaHandleBlur, true);
		this.__voaTarget.addEventListener('mouseenter', this.__voaHandleMouseEnter);
		this.__voaTarget.addEventListener('mouseleave', this.__voaHandleMouseLeave);

		fastdom.mutate(function() {
			this.setAttribute('d2l-visible-on-ancestor-hide', 'd2l-visible-on-ancestor-hide');
		}.bind(this));

	},

	__voaShow: function() {
		fastdom.mutate(function() {
			this.addEventListener('transitionend', this.__voaHandleShowEnd);
			this.setAttribute('d2l-visible-on-ancestor-transition', 'd2l-visible-on-ancestor-transition');
			this.removeAttribute('d2l-visible-on-ancestor-hide');
		}.bind(this));
	},

	__voaUninit: function() {
		if (!this.__voaTarget) return;
		this.__voaTarget.removeEventListener('focus', this.__voaHandleFocus, true);
		this.__voaTarget.removeEventListener('blur', this.__voaHandleBlur, true);
		this.__voaTarget.removeEventListener('mouseenter', this.__voaHandleMouseEnter);
		this.__voaTarget.removeEventListener('mouseleave', this.__voaHandleMouseLeave);
		this.__voaTarget = null;
	}

};

window.D2L = window.D2L || {};
window.D2L.PolymerBehaviors = window.D2L.PolymerBehaviors || {};
window.D2L.PolymerBehaviors.VisibleOnAncestorBehavior = VisibleOnAncestorBehavior;
