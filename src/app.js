// *********************************************************************************************************************
// TOOLS
// *********************************************************************************************************************

function today() {}

function Calendar(container) {
	var calendarNode = init();

	function init() {
		var node = document.querySelector('#templates .Calendar').cloneNode(true);
		container.appendChild(node);
		return node;
	}
}

function startApp() {
	/** @type {Calendar} */
	var calendar = new Calendar(document.querySelector('.calendar-holder'));
}
