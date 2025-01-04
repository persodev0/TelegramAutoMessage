import readline from 'readline';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import fs from 'fs';
import chalk from 'chalk';
import figlet from 'figlet';

console.log(chalk.blue(figlet.textSync('PersoDev', { horizontalLayout: 'full' })));

const apiId = API_ID;
const apiHash = 'API_HASH';
const stringSession = new StringSession('');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });

const groupFilePath = './group.txt';
const messageFilePath = './message.txt';

const askQuestion = (query) => {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
};

(async () => {
    console.log('Telegram istemcisi başlatılıyor...');
    await client.start({
        phoneNumber: async () => await askQuestion('Lütfen telefon numaranızı +905555555555 formatında girin: '),
        phoneCode: async () => await askQuestion('Lütfen doğrulama kodunu girin: '),
        onError: (err) => console.log(err),
    });

    const delayBetweenMessages = parseInt(await askQuestion('Mesajlar arasında kaç saniye beklemek istersiniz? '), 10) * 1000;
    const delayBetweenGroups = parseInt(await askQuestion('Gruplar arasında kaç saniye beklemek istersiniz? '), 10) * 1000;

    rl.close();

    console.log(chalk.green('Giriş başarılı!'));

    const groupData = fs.readFileSync(groupFilePath, 'utf8').trim().split('\n');
    const messageData = fs.readFileSync(messageFilePath, 'utf8').trim().split('\n');

    for (const groupUsername of groupData) {
        for (const message of messageData) {
            try {
                await client.sendMessage(groupUsername, { message });
                console.log(chalk.yellow(`${message} mesajı ${groupUsername} grubuna gönderildi!`));
            } catch (error) {
                console.error(chalk.red('Mesaj gönderme hatası:', error.message));
            }
            await new Promise(resolve => setTimeout(resolve, delayBetweenMessages));
        }
        await new Promise(resolve => setTimeout(resolve, delayBetweenGroups));
    }

    console.log(chalk.green('Tüm gruplara mesajlar gönderildi.'));
})();
