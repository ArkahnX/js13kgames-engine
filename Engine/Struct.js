var Struct = Module(function() {
	// name: Struct
	// target: Client
	// filenames: Engine

	// variables
	var structList = {};
	var structId = -1;
	// end variables

	// functions
	function makeStruct() {
		structId++;
		structList[structId] = LIST_LINKED.apply(this, arguments);
		return structId;
	}

	function getStruct(id) {
		return structList[id];
	}
	// end functions


	return {
		// return
		make: makeStruct,
		get: getStruct
		// end return
	};
});