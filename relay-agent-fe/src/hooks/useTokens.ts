import { APTOS_TOKENS } from "@/constants/actions";

const useTokens = (): (typeof APTOS_TOKENS) => {
    return APTOS_TOKENS
}

export default useTokens;