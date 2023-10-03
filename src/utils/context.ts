import { BoardType } from "@/interface";
import { createContext, useContext } from "react";

interface ContextType {
  state: BoardType;
  setState: (state: BoardType) => void;
}

export const GlobalContext = createContext<ContextType>({} as ContextType);

export const useGlobalState = () => useContext(GlobalContext);
