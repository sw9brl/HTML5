//configure forms features
webshim.setOptions("forms", {
	lazyCustomMessages: true,
	replaceValidationUI: true,
	customDatalist: "auto",
	list: {
		"filter": "^"
	}
});

//configure forms-ext features
webshim.setOptions("forms-ext", {
	replaceUI: true,
	types: "datetime-local date time number month color range",
	date: {
		startView: 2,
		openOnFocus: true,
		classes: "show-week"
	},
	number: {
		calculateWidth: false
	},
	range: {
		classes: "show-activevaluetooltip"
	}
});

//load forms and forms-ext features
webshim.polyfill('forms forms-ext');