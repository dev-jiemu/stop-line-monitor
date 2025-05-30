export function ValidateApiResponse<T>(
        validator: (response: any) => response is T,
        options: {
            returnOnError?: any; // 검증 실패시 반환할 값 (기본: null)
            logError?: boolean;  // 에러 로깅 여부 (기본: true)
        } = {}
) {
    const { returnOnError = null, logError = true } = options;

    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            try {
                const result = await method.apply(this, args);

                if (!validator(result)) {
                    if (logError && this.logger) {
                        this.logger.warn(`Validation failed in ${propertyName}`, {
                            method: propertyName,
                            args: args,
                            response: result
                        });
                    }
                    return returnOnError;
                }

                return result; // 문제 없으면 응답값 그대로 리턴처리
            } catch (error) {
                if (logError && this.logger) {
                    this.logger.error(`API call failed in ${propertyName}`, error);
                }
                return returnOnError;
            }
        };
    };
}