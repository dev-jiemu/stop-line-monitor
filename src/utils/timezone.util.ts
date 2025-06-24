/**
 * 타임존 관련 유틸리티 함수들
 */

export class TimezoneUtil {
    private static readonly KOREA_TIMEZONE = 'Asia/Seoul';
    private static readonly NINE_HOURS_MS = 9 * 60 * 60 * 1000;

    /**
     * 현재 한국 시간을 반환
     */
    static getKoreanTime(): Date {
        return new Date(Date.now() + this.NINE_HOURS_MS);
    }

    /**
     * UTC 시간을 한국 시간으로 변환
     */
    static utcToKorean(utcDate: Date): Date {
        return new Date(utcDate.getTime() + this.NINE_HOURS_MS);
    }

    /**
     * 한국 시간을 UTC로 변환
     */
    static koreanToUtc(koreanDate: Date): Date {
        return new Date(koreanDate.getTime() - this.NINE_HOURS_MS);
    }

    /**
     * 현재 한국 시간을 문자열로 반환 (YYYY-MM-DD HH:mm:ss 형식)
     */
    static getKoreanTimeString(): string {
        return new Date().toLocaleString('ko-KR', {
            timeZone: this.KOREA_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    }

    /**
     * Date 객체를 한국 시간 문자열로 변환
     */
    static toKoreanTimeString(date: Date): string {
        return date.toLocaleString('ko-KR', {
            timeZone: this.KOREA_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    }

    /**
     * 현재 한국 날짜를 YYYY-MM-DD 형식으로 반환
     */
    static getKoreanDateString(): string {
        return new Date().toLocaleDateString('ko-KR', {
            timeZone: this.KOREA_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).replace(/\. /g, '-').replace('.', '');
    }

    /**
     * 로그용 타임스탬프 생성
     */
    static getLogTimestamp(): string {
        return `[${this.getKoreanTimeString()}]`;
    }

    /**
     * 파일명용 타임스탬프 생성 (YYYYMMDD_HHmmss)
     */
    static getFileTimestamp(): string {
        const now = new Date();
        const koreanTime = now.toLocaleString('ko-KR', {
            timeZone: this.KOREA_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        return koreanTime
                .replace(/[^\d]/g, '')
                .replace(/(\d{8})(\d{6})/, '$1_$2');
    }

    /**
     * 한국 시간 기준으로 하루의 시작/끝 시간 계산
     */
    static getKoreanDayRange(date?: Date): { start: Date; end: Date } {
        const targetDate = date || new Date();

        // 한국 시간 기준으로 날짜 문자열 생성
        const dateStr = targetDate.toLocaleDateString('ko-KR', {
            timeZone: this.KOREA_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).replace(/\. /g, '-').replace('.', '');

        const start = new Date(`${dateStr}T00:00:00+09:00`);
        const end = new Date(`${dateStr}T23:59:59+09:00`);

        return { start, end };
    }

    /**
     * 시간대 정보 확인
     */
    static getTimezoneInfo() {
        const now = new Date();
        return {
            systemTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            systemTime: now.toISOString(),
            koreanTime: this.getKoreanTimeString(),
            utcOffset: now.getTimezoneOffset(),
            processTimezone: process.env.TZ,
        };
    }
}
