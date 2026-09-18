from pathlib import Path
from typing import List, Dict


class DatasetScanner:
    """
    Automatically scans the ISL image dataset.

    Every subfolder inside the dataset directory is treated
    as one sign-language class.
    """

    SUPPORTED_EXTENSIONS = {
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".webp",
    }

    def __init__(self, dataset_dir: Path) -> None:
        self.dataset_dir = dataset_dir

    def scan_classes(self) -> List[str]:
        """
        Return all class folder names sorted alphabetically.
        """

        if not self.dataset_dir.exists():
            raise FileNotFoundError(
                f"Dataset directory not found: {self.dataset_dir}"
            )

        if not self.dataset_dir.is_dir():
            raise NotADirectoryError(
                f"Dataset path is not a directory: {self.dataset_dir}"
            )

        classes = [
            folder.name
            for folder in self.dataset_dir.iterdir()
            if folder.is_dir()
        ]

        classes.sort(key=str.lower)

        return classes

    def get_class_images(self, class_name: str) -> List[Path]:
        """
        Return all supported image files belonging to a class.
        """

        class_dir = self.dataset_dir / class_name

        if not class_dir.exists():
            raise FileNotFoundError(
                f"Class directory not found: {class_dir}"
            )

        if not class_dir.is_dir():
            raise NotADirectoryError(
                f"Class path is not a directory: {class_dir}"
            )

        images = [
            path
            for path in class_dir.iterdir()
            if path.is_file()
            and path.suffix.lower() in self.SUPPORTED_EXTENSIONS
        ]

        images.sort(key=lambda path: path.name.lower())

        return images

    def scan(self) -> Dict[str, List[Path]]:
        """
        Scan the complete dataset.

        Returns:
            Dictionary where:
                key   = class name
                value = list of image paths
        """

        classes = self.scan_classes()

        dataset: Dict[str, List[Path]] = {}

        for class_name in classes:
            dataset[class_name] = self.get_class_images(
                class_name
            )

        return dataset

    def print_summary(self) -> None:
        """
        Print a human-readable dataset summary.
        """

        dataset = self.scan()

        print()
        print("=" * 65)
        print("ISL DATASET SCANNER")
        print("=" * 65)
        print()

        print(f"Dataset: {self.dataset_dir}")
        print(f"Classes found: {len(dataset)}")
        print()

        total_images = 0

        for index, (class_name, images) in enumerate(
            dataset.items(),
            start=1,
        ):
            count = len(images)
            total_images += count

            print(
                f"{index:3}. "
                f"{class_name:<30} "
                f"{count:>6} images"
            )

        print()
        print("-" * 65)
        print(f"Total images: {total_images}")
        print(f"Total classes: {len(dataset)}")
        print("=" * 65)
        print()


def main() -> None:
    """
    Test the dataset scanner directly.
    """

    backend_dir = Path(__file__).resolve().parents[2]

    dataset_dir = backend_dir / "data" / "isl_images"

    scanner = DatasetScanner(dataset_dir)

    scanner.print_summary()


if __name__ == "__main__":
    main()