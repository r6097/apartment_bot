{ pkgs }: {
	deps = [
		pkgs.busybox-sandbox-shell
  pkgs.nodejs-16_x
        pkgs.nodePackages.typescript-language-server
        pkgs.yarn
        pkgs.replitPackages.jest
	];
}