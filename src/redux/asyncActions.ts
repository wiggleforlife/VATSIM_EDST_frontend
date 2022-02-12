import {getBoundaryData, getReferenceFixes} from "../api";
import {RootState} from "./store";
import {setReferenceFixes, setSectors} from "./reducers/sectorReducer";

export const fetchSectorData = async (dispatch: any, getState: () => RootState) => {
  const state = getState();
  await getBoundaryData(state.sectorData.artccId)
    .then(response => response.json())
    .then(sectors => {
      dispatch(setSectors(sectors));
    });
};

export const fetchReferenceFixes = async (dispatch: any, getState: () => RootState) => {
  const state = getState();
  await getReferenceFixes(state.sectorData.artccId)
    .then(response => response.json())
    .then(referenceFixes => {
      if (referenceFixes) {
        dispatch(setReferenceFixes(referenceFixes));
      }
    });
};
