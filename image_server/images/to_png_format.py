import sys

args = len(sys.argv) - 1
if args != 1:
    print("invalid number of arguments should be 1 but got {args}")
    os.Exit(1)

file = open(sys.argv[1], "rb")

buf = file.read(4)
format_len = int.from_bytes(buf, byteorder='little', signed=False)
format = file.read(format_len)

buf = file.read(4)
content_len = int.from_bytes(buf, byteorder='little', signed=False)
content = file.read(content_len)

format = format.decode("utf-8").lower() 
out = open(sys.argv[1] + f"_valid.{format}", "wb")
out.write(content)
file.close()
out.close()