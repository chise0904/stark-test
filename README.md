
API文件(swagger):
http://localhost:3000/api


1. 實現訊息提醒任務即將到期
2. 定時重複任務


# A. 實現訊息提醒任務即將到期

## Task Entity 新增欄位

```
- dueDate: 到期日期
- reminderDays: 提前幾天提醒
- notifiedAt: 上次提醒時間（避免重複提醒）
```

## 建立一個排程服務 (TaskReminderService)：

使用 NestJS 的 @nestjs/schedule 模組
設定每天執行一次（或更頻繁）
查找即將到期的任務
向相關用戶發送提醒（可以通過郵件、系統通知等）

建立通知模組來處理不同類型的通知
支援郵件、系統內通知、Webhook 等
記錄通知歷史


使用mail通知
```
import { MailerService } from '@nestjs-modules/mailer';
```

使用slack
```
async postToSlack(message: string) {
    let response = await firstValueFrom(
      this.httpService.post(
        SlackConfig.url,
        {
          username: SlackConfig.botName,
          icon_emoji: SlackConfig.icon,
          channel: SlackConfig.channel,
          text: message,
        },
        {
          headers: {
            Authorization: 'Bearer ' + SlackConfig.token,
          },
        },
      ),
    );
    if (!response.data.ok) {
      throw new HttpException(
        `Failed to send Slack message, details: ${response.data.error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return response.data.message;
}
```


# B. 定時重複任務

## Task Entity 新增欄位

```
- isRecurring: 是否為重複任務
- recurringPattern: 重複模式（每天/每週/每月/自定義）
- recurringInterval: 重複間隔
- recurringDays: 指定重複的日期（例如每月1號和15號）
- lastExecutionTime: 上次執行時間
- nextExecutionTime: 下次執行時間
```

## 建立一個排程服務 (RecurringTaskService)

1. 定期檢查需要重複的任務
2. 根據重複模式創建新的任務實例
3. 複製原任務的基本信息到新任務
4. 更新原任務的執行時間記錄

## 重複任務的處理邏輯：

支援多種重複模式（每天一次、每週特定日、每月特定日等）
處理假日邏輯（是否跳過假日）
處理時區問題
支援結束條件（執行次數或結束日期）




使用 Bull 佇列來處理提醒和重複任務的創建
使用 Redis 來存儲任務執行狀態
實作重試機制處理失敗的提醒


```
// 提醒服務
@Injectable()
export class TaskReminderService {
  @Cron('0 0 * * *') // 每天執行
  async checkDueTasks() {
    // 查找即將到期的任務
    // 發送提醒
  }
}

// 重複任務服務
@Injectable()
export class RecurringTaskService {
  @Cron('0 0 * * *') // 每天執行
  async createRecurringTasks() {
    // 查找需要重複的任務
    // 創建新任務實例
  }
}
```






