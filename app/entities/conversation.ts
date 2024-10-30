import { StringParser, TableEntity } from "@edgefirst-dev/core";

export class Conversation extends TableEntity {
	get name() {
		return this.parser.string("name");
	}

	get userId() {
		return new StringParser(this.parser.string("userId")).cuid();
	}

	get key() {
		return `conversation:${this.parser.string("id")}`;
	}

	get path() {
		return `/chat/${this.id.valueOf()}`;
	}
}
