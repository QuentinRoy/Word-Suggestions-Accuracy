import os

n_char = 0
n_upper = 0
for line in open(os.path.join(os.path.dirname(__file__), "../public/sentences.txt")):
    n_char += len(line) + 1
    n_upper += len(list(filter(lambda x: x.isupper(), line)))

print("{} characters in the set".format(n_char))
print("{} uppercase characters in the set".format(n_upper))
