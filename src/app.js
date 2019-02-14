// *********************************************************************************************************************
// Tools
// *********************************************************************************************************************

function tsToday() {
	const date = new Date();
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date.valueOf();
}

function tsStartOfMonth(ts) {
	const date = new Date(ts);
	date.setDate(1);
	return date.valueOf();
}

function tsDeltaMonth(ts, delta) {
	const date = new Date(ts);
	date.setMonth(date.getMonth() + delta);
	return date.valueOf();
}

function AppEventEmitter() {
	const data = {};

	this.on = on;
	this.emit = emit;

	// ---

	function on(name, handler) {
		data[name] = data[name] || [];
		data[name].push(handler);
	}

	function emit(name, payload) {
		const handlers = data[name] || [];
		for (const handler of handlers) {
			handler(payload, name);
		}
	}
}

// *********************************************************************************************************************
// Components
// *********************************************************************************************************************

const TEMPLATES = {
	calendar: document.querySelector('#templates .Calendar'),
	calendar_day: document.querySelector('#templates .Calendar-day'),
};

function Calendar() {
  const thisCalendar = this;
  
	const cNode = TEMPLATES.calendar.cloneNode(true);
	const cTitle = cNode.querySelector('.Calendar-title');
	const cContent = cNode.querySelector('.Calendar-content');

	cNode.querySelector('.Calendar-next').addEventListener('click', () => {
		emitter.emit(EVENTS.next_month);
	});

	cNode.querySelector('.Calendar-prev').addEventListener('click', () => {
		emitter.emit(EVENTS.prev_month);
	});

	let renderedState = new AppState();
	const emitter = new AppEventEmitter();

	this.update = update;
	this.on = emitter.on;
	this.mount = mount;

	// ---
  
  /**
   * @return {Calendar}
   */
	function mount(target) {
    target.appendChild(cNode);
    return thisCalendar;
  }
  
  function update(state) {
		updateTitle(state);
		updateDays(state);
		renderedState = state;
	}

	function updateTitle(/** AppState */ state) {
		if (!state.activeMonthTs || state.activeMonthTs === renderedState.activeMonthTs) {
			return;
		}

		const activeMonth = new Date(state.activeMonthTs);
		cTitle.innerHTML = activeMonth.getFullYear() + ' / ' + (activeMonth.getMonth() + 1);
	}

	function updateDays(/** AppState */ state) {
		if (!state.activeMonthTs || state.activeMonthTs === renderedState.activeMonthTs) {
			return;
		}

		// Clean
		for (const dayNode of cNode.querySelectorAll('.Calendar-day')) {
			dayNode.remove();
		}

		// Recreate
		const todayTs = tsToday();
		const date = new Date(state.activeMonthTs);
		const startMonth = date.getMonth();
		while (date.getMonth() === startMonth) {
			const dayNode = TEMPLATES.calendar_day.cloneNode(true);
			const dateTs = date.valueOf();
			dayNode.innerText = date.getDate();
			if (dateTs === todayTs) {
				dayNode.className += ' today';
			}
			if (dateTs < todayTs) {
				dayNode.className += ' past';
			} else {
				dayNode.className += ' selectable';
			}
			if (dateTs === state.selectedDayTs) {
				dayNode.className += ' selected';
			}
      cContent.appendChild(dayNode);
			date.setDate(date.getDate() + 1);
		}
	}
}

// *********************************************************************************************************************
// App
// *********************************************************************************************************************

const EVENTS = {
	next_month: 'next_month',
	prev_month: 'prev_month',
};

class AppState {
	constructor(/** AppState */ source = {}) {
		this.activeMonthTs = undefined;
		this.selectedDayTs = undefined;

		Object.assign(this, source);
	}
}

function run() {
	let state = new AppState({
		activeMonthTs: tsStartOfMonth(tsToday()),
	});

	/** @type {Calendar} */
	const calendar = new Calendar().mount(document.querySelector('.calendar-holder'));
	calendar.on(EVENTS.next_month, () => {
		console.log('next');
		update({
			activeMonthTs: tsDeltaMonth(state.activeMonthTs, 1),
		});
	});
	calendar.on(EVENTS.prev_month, () => {
		update({
			activeMonthTs: tsDeltaMonth(state.activeMonthTs, -1),
		});
	});

	update();

	// ---

	function update(/** AppState */ nextState) {
		if (nextState) {
			state = new AppState({
				...state,
				...nextState,
			});
		}
		calendar.update(state);
	}
}
