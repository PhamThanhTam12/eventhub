import { readFileSync } from "node:fs";

const placeholder = readFileSync(new URL("../../public/event-placeholder.svg", import.meta.url), "utf8");

export async function mockApi(page) {
  const state = {
    events: [
      {
        id: "1", title: "Workshop React cơ bản", category: "Công nghệ",
        description: "Cùng học React, thực hành component và làm giao diện.",
        image: "https://images.unsplash.com/react-test.jpg",
        startAt: "2030-12-12T08:00:00+07:00", location: "Hội trường A",
        price: 0, capacity: 80,
      },
      {
        id: "2", title: "Ngày hội định hướng nghề nghiệp", category: "Nghề nghiệp",
        description: "Gặp gỡ doanh nghiệp và tìm hiểu những cơ hội thực tập.",
        image: "https://images.unsplash.com/career-test.jpg",
        startAt: "2030-12-15T09:00:00+07:00", location: "Trung tâm Hội nghị",
        price: 50000, capacity: 100,
      },
      {
        id: "3", title: "Đêm nhạc kết nối sinh viên", category: "Âm nhạc",
        description: "Giao lưu âm nhạc và kết nối cùng các câu lạc bộ sinh viên.",
        image: "https://images.unsplash.com/music-test.jpg",
        startAt: "2030-12-20T18:30:00+07:00", location: "Sân khấu ngoài trời",
        price: 30000, capacity: 150,
      },
    ],
    bookings: [],
    nextEventId: 10,
    nextBookingId: 1,
    requests: [],
    failNext: null,
    failAlways: null,
    delays: {},
  };

  await page.route("https://images.unsplash.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "image/svg+xml", body: placeholder })
  );

  await page.route("https://eventhub-tests.mockapi.io/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const path = new URL(request.url()).pathname;
    const [resource, encodedId] = path.split("/").filter(Boolean);
    const id = encodedId ? decodeURIComponent(encodedId) : null;
    const key = method + " " + path;
    const headers = {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
      "access-control-allow-headers": "Content-Type",
    };
    const reply = (body, status = 200) =>
      route.fulfill({ status, headers, body: JSON.stringify(body) });

    if (method === "OPTIONS") return route.fulfill({ status: 204, headers });
    const body = request.postData() ? request.postDataJSON() : undefined;
    state.requests.push({ method, path, body });

    if (state.delays[key]) {
      await new Promise((resolve) => setTimeout(resolve, state.delays[key]));
    }

    if (state.failNext === key || state.failAlways === key) {
      state.failNext = null;
      return reply({ message: "Temporary failure" }, 500);
    }

    if (!["events", "bookings"].includes(resource)) return reply({}, 404);
    const records = state[resource];

    if (method === "GET") {
      const data = id ? records.find((item) => item.id === id) : records;
      return data ? reply(data) : reply({ message: "Not found" }, 404);
    }

    if (method === "POST") {
      const generatedId = resource === "events"
        ? String(state.nextEventId++) : String(state.nextBookingId++);
      const record = { ...body, id: generatedId };
      records.push(record);
      return reply(record, 201);
    }

    const index = records.findIndex((item) => item.id === id);
    if (index === -1) return reply({ message: "Not found" }, 404);

    if (method === "PUT") {
      records[index] = { ...records[index], ...body, id };
      return reply(records[index]);
    }

    if (method === "DELETE") {
      return reply(records.splice(index, 1)[0]);
    }

    return reply({}, 405);
  });

  return state;
}
