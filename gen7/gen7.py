import random

def generate_ascii_pattern(width, height):
    pattern = []
    for y in range(height):
        row = []
        for x in range(width):
            if (x + y) % 2 == 0:
                row.append('/')
            else:
                row.append('\\')
        pattern.append("".join(row))
    
    # Add clover patterns
    for _ in range(10):  # Number of clover clusters
        clover_x = random.randint(0, width - 3)
        clover_y = random.randint(0, height - 3)
        pattern[clover_y] = pattern[clover_y][:clover_x] + "%%%" + pattern[clover_y][clover_x + 3:]
        pattern[clover_y + 1] = pattern[clover_y + 1][:clover_x] + "%%%" + pattern[clover_y + 1][clover_x + 3:]
        pattern[clover_y + 2] = pattern[clover_y + 2][:clover_x] + "%%%" + pattern[clover_y + 2][clover_x + 3:]
    
    return "\n".join(pattern)

def main():
    width = 120
    height = int(120 * 0.55)
    ascii_pattern = generate_ascii_pattern(width, height)
    print(ascii_pattern)

if __name__ == "__main__":
    main()