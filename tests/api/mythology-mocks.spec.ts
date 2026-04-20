import {test, expect} from '@playwright/test';
import {MythologyCategory} from "../../src/api/mythology";

const resolveApiUrls = (): { apiOrigin: string; loginUrl: string; getMythologyUrl: string } => {
    const configuredBaseUrl = process.env.BASE_URL?.trim() || 'https://api.qasandbox.ru/api/';
    const normalizedBaseUrl = configuredBaseUrl.endsWith('/')
        ? configuredBaseUrl
        : `${configuredBaseUrl}/`;

    return {
        apiOrigin: new URL(normalizedBaseUrl).origin,
        loginUrl: new URL('login', normalizedBaseUrl).toString(),
        getMythologyUrl: new URL('mythology', normalizedBaseUrl).toString(),
    };
};

type listHeroes = {
    id:  number,
    name: string,
    category: MythologyCategory,
}[]

test('Patch the JSON with Mocked Hero', async ({ page }) => {
    const { getMythologyUrl } = resolveApiUrls();

    await page.route('**/api/mythology', async (route) => {
        const response = await route.fetch();
        const originalBody = await response.json();

        const mockedHero = {
            id:  Math.floor((Math.random() + 1) * 100),
            name: 'Mocked Hero',
            category: "heroes",
        };
        const patchedBody = [...originalBody, mockedHero];

        await route.fulfill({
            status: response.status(),
            body: JSON.stringify(patchedBody),
        });
    });


    const data: listHeroes = await page.evaluate(
        async ({ getMythologyUrl }) => {
            const res = await fetch(getMythologyUrl, {
                method: "GET",
            });
            return await res.json();
        },
        { getMythologyUrl }
    );

    expect(data.some((item: any) => item.name === 'Mocked Hero')).toBe(true);

});