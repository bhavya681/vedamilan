# Rule Engines (Module 5)

AI never calculates astrology. These TypeScript engines produce scores that agents may only explain later.

## Engines

| Engine          | Input                                    | Output                                |
| --------------- | ---------------------------------------- | ------------------------------------- |
| Ashta Koota     | Moon signs, nakshatras, manglik statuses | 8 kootas / 36, dosha flags, overall % |
| Marriage timing | Dasha periods + manglik                  | Scored activation windows             |

## APIs

| Method   | Path                   | Purpose                          |
| -------- | ---------------------- | -------------------------------- |
| GET/POST | `/api/compatibility`   | List / compute & persist reports |
| GET      | `/api/marriage-timing` | Windows for current user         |

## Wired pages

- `/dashboard/compatibility`
- `/dashboard/kundli/marriage-timing`
