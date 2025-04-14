import { Tool } from "../../../../types";
import { ToolActionType } from "../types/toolType";
import { AnyAction } from 'redux';

const initialState: Tool = {
    type: 'cursor'
}

const toolReducer = (state: Tool = initialState, action: AnyAction): Tool => {
    switch (action.type) {
        case ToolActionType.SET_TOOL:
            return action.payload.newTool

        default: 
            return state
    }
}

export default toolReducer
